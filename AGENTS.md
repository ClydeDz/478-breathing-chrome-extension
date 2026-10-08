# AGENTS.md

Memory and instructions for AI agents (and humans) working on this repository.
Last verified: 2026-10-08 (branch `dev/audio`, v1.2.0).

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

## Local build gotcha (important)

CI (`.github/workflows/build-deploy.yml`) builds on **Node 13.x** and is the source
of truth. On a modern local Node (≥17), `npm run build:prod` fails twice:

1. `ERR_OSSL_EVP_UNSUPPORTED` — webpack 5's md4 hashing vs OpenSSL 3.
   `NODE_OPTIONS=--openssl-legacy-provider` fixes only this.
2. `node-sass@4` does not support modern Node runtimes — this is a hard blocker;
   it needs Node ≤14 plus its prebuilt binding.

Verified working local recipe (Windows, Node 22, run from repo root):

```bash
# one-time setup
DIR="$HOME/.cache/node14"
npm install --prefix "$DIR" --no-save --no-package-lock node@14.21.3
(cd "$DIR/node_modules/node" && node installArchSpecificPackage.js)  # npm blocks this package's install script
NODE14="$DIR/node_modules/node/bin/node.exe"
"$NODE14" node_modules/node-sass/scripts/install.js                   # downloads node-sass prebuilt binding

# build (equivalent to CI's npm run build:prod)
"$NODE14" node_modules/webpack-cli/bin/cli.js --mode=production
```

Alternative: swap `node-sass` for dart-`sass` via sass-loader's `implementation`
option (sass-loader 7.3.1 supports it) — but that changes the repo's toolchain, so
prefer the recipe above unless the dependency change is actually wanted.

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
| 22 | "Ready" | tick |
| 21 | "Steady" | tick |
| 20 | "Go" | tick |
| 19–16 | Inhale, countdown 4→1 | **cue "inhale" once at 19** + tick |
| 15–9 | Hold, countdown 7→1 | **cue "hold" once at 15** + tick |
| 8–1 | Exhale, countdown 8→1 | **cue "exhale" once at 8** + tick |
| 0 | round ends: `currentRound++`, interval cleared, exercise reset, then either the next round starts or the completion screen shows | — |

Gotchas:

- `settings.inhale/hold/exhale` are **decremented** by the step functions; only
  `resetExercise()` restores them (4/7/8 and duration 22).
- `performExerciseStep` ignores out-of-bounds durations (`<0` or `>22`) — tests pin this.
- `actions.js` and `exercise.js` import each other (circular). It works because all
  references are function calls resolved at runtime; don't "fix" it casually.

## Audio feature (v1.2.0)

Files: `src/audio/{inhale,hold,exhale,clock-one-tick}.mp3`, copied to `dist/audio/`.

- Toggle: `#audioToggle` button on the home screen ("🔇 Sound off" / "🔊 Sound on").
  State lives in `audio.js` (`isAudioEnabled`/`toggleAudio`) — **not persisted** across
  page loads. The initial label is hardcoded in `src/index.html` and must stay in sync
  with `uiModule.updateAudioButton()`.
- Behavior when enabled:
  - Phase cue mp3 plays **once, when a phase begins** (durations 19/15/8 in
    `performExerciseStep`) — not every second of the phase.
  - `clock-one-tick.mp3` plays **every second** the exercise interval runs
    (`startExerciseIntervalFunction` plays the tick before stepping).
  - Turning the toggle off, going back home, or reaching the completion screen calls
    `stopAllAudio()` (pause + rewind).
- Implementation notes: one lazily-created `Audio` element per cue, restarted via
  `currentTime = 0`; `play()` promise rejections are caught on purpose (autoplay
  policy — audio is a progressive enhancement and must never break the exercise);
  `initializeAudio(factory)` exists so tests can inject fake elements.
- Manual check still worth doing once in a real browser (autoplay audibility cannot
  be proven headlessly): load the extension, click 🔇→🔊, Start, and confirm you hear
  cues through at least one full round.

## Testing conventions & gotchas

5 suites / 78 tests, all green as of 2026-10-08 (`src/tests/*.test.js`).

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
  starts failing in CI after committing the lockfile, either regenerate it with npm 6
  or bump the CI Node version **to ≤14** (node-sass 4.14 caps at Node 14).
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

Expected (with audio ON): label `🔊 Sound on`; home hidden; at ~11 s → title
`Round 1 of 1`, action `Hold`, countdown `5`; log = tick played 10×, `inhale.mp3` ×1,
`hold.mp3` ×1, no `exhale.mp3`; `errors: []`.

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
