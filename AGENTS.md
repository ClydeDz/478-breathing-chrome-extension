# AGENTS.md

Memory and instructions for AI agents (and humans) working on this repository.
Last verified: 2026-10-09 (branch `dev/audio`, v1.2.0; builds verified on Node 22 and Node 13).

## What this repo is

A Chrome extension (Manifest V3) that overrides the browser's new-tab page
(`chrome_url_overrides.newtab` in `src/manifest.json`) with a **4-7-8 breathing
exercise**: inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds, for a
user-selected number of rounds.

- Purely client-side: no backend, no framework. Vanilla ES modules + jQuery for DOM,
  SCSS for styles, webpack 5 for bundling, Jest 27 for tests.
- jQuery is a runtime dependency; everything else in `dependencies`/`devDependencies`
  is build tooling.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Clean install (package-lock.json is lockfileVersion 3, needs npm ≥7) |
| `npm test` | Run Jest once (works on modern Node, e.g. v22) |
| `npm run test:ci` | What CI runs: `--coverage --ci --testResultsProcessor=jest-junit --watchAll=false` (writes `junit.xml`, `coverage/`, both gitignored) |
| `npm run build` | Webpack in watch mode (development) |
| `npm run build:prod` | Production build → `dist/` (this is what ships) |

Build outputs to `dist/` (gitignored): `bundle.js`, `index.css`, plus copies of
`index.html`, `manifest.json`, `icons/`, `fonts/`, `audio/` (subdirectory structure
is preserved by CopyWebpackPlugin — see `webpack.config.js`). To try the extension:
`npm run build:prod`, then load `dist/` as an unpacked extension at
`chrome://extensions`.

## Building on modern Node (and CI)

`npm run build:prod` works out of the box on **Node 22** (verified 2026-10-08), and
the output is **byte-identical** to a build run under CI's Node 13. Two fixes made
this possible — keep both in place:

1. `output.hashFunction: "xxhash64"` in `webpack.config.js`. Webpack's default `md4`
   goes through OpenSSL, which Node 17+ (OpenSSL 3) removed — that was the
   `ERR_OSSL_EVP_UNSUPPORTED` crash (it surfaced inside DefinePlugin, which hashes
   with `compilation.outputOptions.hashFunction`).
2. `node-sass@4` (deprecated; no binaries for modern Node) was replaced by dart-`sass`,
   **pinned exactly to `1.60.0`** — the last release with `engines: node >=12`
   (1.61+ requires Node ≥14; current sass requires ≥20.19). CI runs Node 13, so do
   **not** convert this to a caret range or bump it without also bumping CI's Node
   version. sass-loader 7.3.1 auto-detects dart-sass when node-sass is absent
   (it prefers node-sass if installed) and accepts dart-sass `^1.3.0`.

Install gotcha: modern npm refuses installs with ERESOLVE, because `css-loader@1`
declares a peer on `webpack@^4` while the repo uses webpack 5 (pre-existing
conflict). The project `.npmrc` sets `legacy-peer-deps=true` to handle this — keep
that file (CI's npm 6 ignores the unknown key).

Historical: before the fixes above, local builds needed a Node 14 binary plus
node-sass's prebuilt binding — that workaround is obsolete and no longer needed.

## Architecture (`src/scripts/`)

Dependency direction: `index.js` → `ui.js` → (`actions.js` ⇄ `exercise.js`) → `settings.js`,
with `audio.js` as a leaf module (imports nothing from the project).

- `index.js` — entry. On DOM ready: injects the jQuery instance into `ui` via
  `uiModule.initializeJQuery(jQuery)`, then `uiModule.initTriggers()`.
- `ui.js` — the **only** module that touches the DOM, always through the injected
  jQuery (this is how tests fake the DOM). Also owns the audio-toggle button label.
- `actions.js` — screen/mode switches (`switchToHomeMode`, `switchToExerciseInProgressMode`,
  `switchToRoundCompleteMode`, `switchToExerciseCompleteMode`) and `startExercise()`
  which sets the 1-second `setInterval`.
- `exercise.js` — `performExerciseStep(duration)`, the per-second state machine.
- `settings.js` — mutable global `settings` object + `intervalTimer` + `resetExercise()` /
  `clearExerciseInterval()`. NOTE: `clearExerciseInterval()` reads the module-level
  `intervalTimer`, and `startExercise()` assigns it — always go through the module.
- `audio.js` — sound cues + on/off toggle (added in v1.2.0, see below).

### Exercise timing model

`settings.exerciseDuration` counts **22 → 0**, one step per 1000 ms interval tick:

| duration | screen | audio (when enabled) |
| --- | --- | --- |
| 22 | "Ready" | **`lets-begin` on round 1 only** (warms up audio before the first beep); rounds 2+ are silent and only reach this duration when the pause is on |
| 21 | "Steady" | **silent** |
| 20 | "Go" | **silent** |
| 19–16 | Inhale, countdown 4→1 | spoken "inhale" once at 19 + **`inhale-beep` on every tick** |
| 15–9 | Hold, countdown 7→1 | spoken "hold" once at 15 + **`hold-beep` on every tick** |
| 8–1 | Exhale, countdown 8→1 | spoken "exhale" once at 8 + **`exhale-beep` on every tick** |
| 0 | round ends: `currentRound++`, interval cleared, exercise reset; if more rounds follow: **pause on** → round-complete screen, **pause off (default)** → the same tick runs `performExerciseStep(19)`, so the next round's inhale starts immediately | **pause on** → `next-round` when another round follows; **pause off (default)** → the next round's `inhale` cue + `inhale-beep` instead; last round → **`complete`** (played *after* `switchToExerciseCompleteMode()`, which stops lingering audio) |

Gotchas:

- `settings.inhale/hold/exhale` are **decremented** by the step functions; only
  `resetExercise()` restores them (4/7/8 and duration 22).
- The "Add pause between rounds" checkbox (`#pauseBetweenRounds`, **unchecked by
  default**) is read into `settings.pauseBetweenRounds` once, in
  `switchToExerciseInProgressMode()`, and is intentionally *not* reset when going
  home or completing. With it off, `performExerciseStep(0)` sets
  `exerciseDuration = 19` and then recurses into `performExerciseStep(19)` in the
  same tick: that step owns the "inhale" cue and the first count of 4, and its
  trailing `--exerciseDuration` leaves the value at 18, so the next tick
  continues the countdown at 3.
- `performExerciseStep` ignores out-of-bounds durations (`<0` or `>22`) — tests pin this.
- `actions.js` and `exercise.js` import each other (circular). It works because all
  references are function calls resolved at runtime; don't "fix" it casually.

## Audio feature (v1.2.0)

Files: `src/audio/{lets-begin,inhale,hold,exhale,inhale-beep,hold-beep,exhale-beep,next-round,complete}.mp3`,
copied to `dist/audio/`. `clock-one-tick.mp3` was removed when phase beeps replaced
the per-second tick; `audio.test.js` asserts that files on disk and `AUDIO_SOURCES`
stay in exact sync (both directions), so adding/deleting an mp3 without updating the
code fails the suite.

- Toggle: small `#audioToggle` button, **`position: fixed` top-LEFT of the viewport
  (the top-right corner hosts the exercise close icon `#exerciseEnd`)**, outside all
  three screens (direct child of `<body>`) so it is visible on home,
  in-progress and completion screens alike — users can mute/unmute at any moment,
  including mid-exercise. Label: "🔇 Sound off" / "🔊 Sound on". State lives in
  `audio.js` (`isAudioEnabled`/`toggleAudio`) — **not persisted** across page loads.
  The initial label is hardcoded in `src/index.html` and must stay in sync with
  `uiModule.updateAudioButton()`. Styling lives in `_general.scss`.
- Behavior when enabled (see the timing table above): `lets-begin` at duration 22 of
  round 1, spoken phase cue once at phase start, phase beep every tick of the phase,
  silence during Ready/Steady/Go (except the round-1 `lets-begin`),
  `next-round` (only when the pause checkbox is on) / `complete` at round end.
  Turning the toggle off, going back home, or
  reaching the completion screen calls `stopAllAudio()` (pause + rewind).
- Implementation notes: **all audio elements are created eagerly the moment the
  toggle turns on** (`preloadAudio()`; elements use `preload = "auto"`), so the first
  cue of an exercise never pays the create/fetch cost mid-exercise — this fixed the
  "first inhale beep inaudible on the very first run" bug, with `lets-begin` also
  warming the audio output during the silent Ready second. One shared `Audio`
  element per cue afterwards, restarted via `currentTime = 0`; `play()` promise
  rejections are caught on purpose (autoplay policy — audio is a progressive
  enhancement and must never break the exercise); `initializeAudio(factory)` exists
  so tests can inject fake elements; `AUDIO_SOURCES` is exported for the disk-sync test.
- Manual check still worth doing once in a real browser (autoplay audibility cannot
  be proven headlessly): load the extension, click 🔇→🔊, Start, and confirm you hear
  cues through at least one full round.

## Testing conventions & gotchas

5 suites / 99 tests, all green as of 2026-10-09 (`src/tests/*.test.js`).

- Jest runs in the **node** environment — there is no DOM. `ui.test.js` injects
  `src/tests/mocks/jqueryMock.js` through `uiModule.initializeJQuery()`.
- Tests spy on module **namespace exports** (`jest.spyOn(uiModule, "updateTitle")`)
  with `.mockImplementation(jest.fn())` at module scope and `jest.clearAllMocks()` in
  `beforeEach`. This works because Babel transpiles ESM → CJS; follow the same pattern.
- `ui.test.js` "binds triggers" asserts **exact** call counts of `.on(...)` — if you
  add/remove a binding, update that test (it broke when the audio toggle was added).
- `audio.test.js` uses `jest.resetModules()` + `require` in `beforeEach` because the
  audio module keeps per-file mutable state (enabled flag, element cache).
- `settings.test.js` has a known `// TODO: Explore why this value is 0` around
  `clearInterval` under fake timers — pre-existing, not a regression.
- When adding UI wiring: assert both the DOM selector and the exact text set, and
  assert *absence* of side effects for out-of-bounds/no-audio paths (existing tests
  do this).

## Repo conventions (from `docs/CONTRIBUTING.md`)

- Discuss in an issue first; keep PRs to the smallest useful unit.
- **Unit tests are mandatory** for changes.
- Bump versions with semver in **`src/manifest.json`**, **`package.json`**, and the two
  root entries of `package-lock.json` (line ~3 `"version"` and `packages[""].version`);
  don't touch dependency versions that happen to match. Feature = minor (1.1.1 → 1.2.0).
- `package-lock.json` in the working tree has been regenerated to lockfileVersion 3 by
  modern npm. CI installs with Node 13 / npm 6, which predates lockfile v3 — if `npm ci`
  fails in CI after committing the lockfile, either regenerate the lock with npm 6 or
  bump CI's Node version (16+, ideally 18; the toolchain — webpack `xxhash64`, dart-sass
  1.60, Jest 27 — all support modern Node now, verified on Node 22). Note that npm 7+
  enforces peer deps, so a CI bump relies on the project `.npmrc` above.
- CI on push/PR to `main`: `npm ci` → `npm run build:prod` → `npm run test:ci` →
  uploads `dist/` artifact; pushes to `main` also publish to the Chrome Web Store
  (secrets required). Docs/markdown changes don't trigger it (`paths-ignore`).

## Smoke-testing the built page (headless Chrome)

Unit tests can't prove the wiring; this recipe can (it caught real bugs). It generates
a throwaway `dist/_smoke.html` from the **built** `dist/index.html`, then drives it:

1. Generate `_smoke.html` by inserting two inline scripts into `dist/index.html`:
   - before the `bundle.js` script tag: an Audio spy (`window.Audio` wrapper logging
     `new:`/`play:` calls into `window.__audioLog`) plus `window.onerror` collection;
   - before `</body>`: on `load`, a `setTimeout(1000)` that clicks `#audioToggle` then
     `#start`, and a `setTimeout(11000)` that writes state (label, title, action,
     countdown, visibility, logs) into `<pre id="probe">`.
2. Run:
   ```bash
   chrome --headless=new --disable-gpu --disable-extensions --no-first-run \
     --user-data-dir="$PWD/dist/.smoke-profile" --autoplay-policy=no-user-gesture-required \
     --virtual-time-budget=13000 --dump-dom "file:///<abs path>/dist/_smoke.html"
   ```
   (`--user-data-dir` is required if Chrome is already running; `file:///` needs the
   absolute D:/ path form.)
3. Extract: `grep -o '<pre id="probe">@@PROBE@@[^<]*' out.html | sed 's|<pre id="probe">@@PROBE@@||'`.

Expected, short run (11 s virtual, audio ON): label `🔊 Sound on`; home hidden; title
`Round 1 of 1`, action `Hold`, countdown `5`; button `position:fixed, top:10,
leftGap:10, visibleDuringExercise:true`; log `created:` = all 9 elements at toggle
time (preload), `played:` = `lets-begin` ×1 (duration 22), `inhale.mp3` ×1,
`inhale-beep` ×4, `hold.mp3` ×1, `hold-beep` ×3, no `clock-one-tick`; `errors: []`.

Expected, full 2-round run with the pause checkbox **unchecked (default)** (set
`roundsSelection.value = "2"` before Start, probe at ~45 s, budget 47 s): completion
screen visible (`home:false, inProgress:false, complete:true`); log = `lets-begin` ×1
(round 1 only), each voice ×2, `inhale-beep` ×8, `hold-beep` ×14, `exhale-beep` ×16,
**`next-round` ×0**, `complete` ×1; `errors: []`; UI samples around t=24 s must go
straight from `Exhale|1|Round 1 of 2` to `Inhale|4|Round 2 of 2` (no round-complete
screen, no Ready/Steady/Go). Checking the box first restores the old numbers:
probe ~49 s, budget 52 s, `next-round` ×1, with a `Round 2` pause screen between rounds.

Critical details learned the hard way:

- **Clicks must be deferred (e.g. +1000 ms virtual time).** jQuery 3 runs ready
  handlers via `window.setTimeout`, so handlers may not be bound yet at the `load`
  event under `--virtual-time-budget`. Clicking at `load` yields a false negative
  (nothing responds).
- `window.jQuery` is **undefined** in the bundle (webpack scopes jQuery) — don't use
  it as a "did the bundle run" marker.
- Emoji in HTML files must be real characters: HTML does not decode `\ud83d\udd07`
  escapes (JS string literals do — that's why `ui.js` escapes are fine but the
  `index.html` label must be literal 🔇).
- Clean up `_smoke*.html` and `.smoke-profile` afterwards (they're inside gitignored
  `dist/` anyway).

## Branch context

- Working branch: `dev/audio` (audio feature). `main` is the deploy branch.
- One human contributor; commits are short and imperative ("Bump version to 1.1.1").
