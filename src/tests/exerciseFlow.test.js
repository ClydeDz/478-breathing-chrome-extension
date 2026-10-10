import * as uiModule from "../scripts/ui";
import * as settingsModule from "../scripts/settings";
import * as actionModule from "../scripts/actions";
import * as audioModule from "../scripts/audio";

// Round-to-round integration test. Only the DOM-facing UI calls and the audio
// cues are mocked; resetExercise(), clearExerciseInterval(), startExercise()
// and the mode switches stay real, so fake timers drive a full two-round
// exercise exactly the way the extension runs it. This catches a broken reset
// or a lost timer tick that unit tests with mocked timers cannot see.

const updateTitleSpy = jest.spyOn(uiModule, "updateTitle")
    .mockImplementation(jest.fn());
const updateActionSpy = jest.spyOn(uiModule, "updateAction")
    .mockImplementation(jest.fn());
const updateCountdownSpy = jest.spyOn(uiModule, "updateCountdown")
    .mockImplementation(jest.fn());
const toggleCountdownClassSpy = jest.spyOn(uiModule, "toggleCountdownClass")
    .mockImplementation(jest.fn());
const toggleHomeVisibilitySpy = jest.spyOn(uiModule, "toggleHomeVisibility")
    .mockImplementation(jest.fn());
const toggleExerciseInProgressVisibilitySpy = jest.spyOn(uiModule, "toggleExerciseInProgressVisibility")
    .mockImplementation(jest.fn());
const toggleExerciseCompleteVisibilitySpy = jest.spyOn(uiModule, "toggleExerciseCompleteVisibility")
    .mockImplementation(jest.fn());
const resetRoundDropdownValueSpy = jest.spyOn(uiModule, "resetRoundDropdownValue")
    .mockImplementation(jest.fn());

const playAudioCueSpy = jest.spyOn(audioModule, "playAudioCue")
    .mockImplementation(jest.fn());
const stopAllAudioSpy = jest.spyOn(audioModule, "stopAllAudio")
    .mockImplementation(jest.fn());

// Pass-through spies: they record calls but still run the real functions.
const switchToRoundCompleteModeSpy = jest.spyOn(actionModule, "switchToRoundCompleteMode");
const switchToExerciseCompleteModeSpy = jest.spyOn(actionModule, "switchToExerciseCompleteMode");

jest.useFakeTimers();

describe("two rounds without a pause between rounds", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        settingsModule.resetExercise();
        settingsModule.settings.rounds = 2;
        settingsModule.settings.currentRound = 1;
        settingsModule.settings.pauseBetweenRounds = false;
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    test("flows Exhale/1 straight into Inhale/4, ticks to Inhale/3 and completes", () => {
        actionModule.startExercise();

        // Round 1 runs from Ready down to the last second of the exhale.
        jest.advanceTimersByTime(22 * 1000);
        expect(updateActionSpy).toHaveBeenLastCalledWith("Exhale");
        expect(updateCountdownSpy).toHaveBeenLastCalledWith("1");

        // The round ends. With no pause, the next round's inhale starts in the
        // same tick. The countdown can only show 4 if the real resetExercise()
        // restored the counters first — the round-1 inhale left it at 0.
        jest.advanceTimersByTime(1000);
        expect(updateTitleSpy).toHaveBeenLastCalledWith("Round 2 of 2");
        expect(updateActionSpy).toHaveBeenLastCalledWith("Inhale");
        expect(updateCountdownSpy).toHaveBeenLastCalledWith("4");
        expect(settingsModule.settings.inhale).toBe(3);
        expect(settingsModule.settings.exerciseDuration).toBe(18);
        expect(switchToRoundCompleteModeSpy).not.toHaveBeenCalled();

        // One second later the countdown continues at 3. This fails if the old
        // interval kept running (counts race ahead) or never handed over
        // (the next tick never arrives).
        jest.advanceTimersByTime(1000);
        expect(updateActionSpy).toHaveBeenLastCalledWith("Inhale");
        expect(updateCountdownSpy).toHaveBeenLastCalledWith("3");

        // Round 2 counts the inhale down 2, 1...
        jest.advanceTimersByTime(2000);
        expect(updateCountdownSpy).toHaveBeenLastCalledWith("1");

        // ...then holds from its reset value of 7 again...
        jest.advanceTimersByTime(1000);
        expect(updateActionSpy).toHaveBeenLastCalledWith("Hold");
        expect(updateCountdownSpy).toHaveBeenLastCalledWith("7");

        // ...then finishes the hold and exhales from its reset value of 8.
        jest.advanceTimersByTime(6000);
        expect(updateActionSpy).toHaveBeenLastCalledWith("Hold");
        expect(updateCountdownSpy).toHaveBeenLastCalledWith("1");
        jest.advanceTimersByTime(1000);
        expect(updateActionSpy).toHaveBeenLastCalledWith("Exhale");
        expect(updateCountdownSpy).toHaveBeenLastCalledWith("8");

        // Run out round 2: the last exhale second, then the round end.
        jest.advanceTimersByTime(7000);
        expect(updateActionSpy).toHaveBeenLastCalledWith("Exhale");
        expect(updateCountdownSpy).toHaveBeenLastCalledWith("1");
        jest.advanceTimersByTime(1000);

        // The exercise completes without ever showing the round pause screen.
        expect(switchToExerciseCompleteModeSpy).toHaveBeenCalledTimes(1);
        expect(switchToRoundCompleteModeSpy).not.toHaveBeenCalled();
        expect(toggleExerciseCompleteVisibilitySpy).toHaveBeenLastCalledWith(true);
        expect(toggleExerciseInProgressVisibilitySpy).toHaveBeenLastCalledWith(false);
        expect(settingsModule.settings.currentRound).toBe(3);
        expect(playAudioCueSpy).toHaveBeenCalledWith("complete");
        expect(playAudioCueSpy).not.toHaveBeenCalledWith("next-round");

        // Nothing is left ticking after completion, so no further steps run.
        expect(jest.getTimerCount()).toBe(0);
        const actionCalls = updateActionSpy.mock.calls.length;
        const titleCalls = updateTitleSpy.mock.calls.length;
        jest.advanceTimersByTime(10000);
        expect(updateActionSpy).toHaveBeenCalledTimes(actionCalls);
        expect(updateTitleSpy).toHaveBeenCalledTimes(titleCalls);
    });
});
