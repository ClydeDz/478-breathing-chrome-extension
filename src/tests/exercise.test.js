import * as uiModule from "../scripts/ui";
import * as exerciseModule from "../scripts/exercise";
import * as settingsModule from "../scripts/settings";
import * as actionModule from "../scripts/actions";
import * as audioModule from "../scripts/audio";

const updateTitleSpy = jest.spyOn(uiModule, "updateTitle")
    .mockImplementation(jest.fn());
const updateActionSpy = jest.spyOn(uiModule, "updateAction")
    .mockImplementation(jest.fn());
const updateCountdownSpy = jest.spyOn(uiModule, "updateCountdown")
    .mockImplementation(jest.fn());
const toggleCountdownClassSpy = jest.spyOn(uiModule, "toggleCountdownClass")
    .mockImplementation(jest.fn());

const resetExerciseSpy = jest.spyOn(settingsModule, "resetExercise")
    .mockImplementation(jest.fn());
const clearExerciseIntervalSpy = jest.spyOn(settingsModule, "clearExerciseInterval")
    .mockImplementation(jest.fn());

const switchToExerciseCompleteModeSpy = jest.spyOn(actionModule, "switchToExerciseCompleteMode")
    .mockImplementation(jest.fn());
const startExerciseSpy = jest.spyOn(actionModule, "startExercise")
    .mockImplementation(jest.fn());
const switchToRoundCompleteModeSpy = jest.spyOn(actionModule, "switchToRoundCompleteMode")
    .mockImplementation(jest.fn());
const playAudioCueSpy = jest.spyOn(audioModule, "playAudioCue")
    .mockImplementation(jest.fn());

describe("exerciseSteps → performExerciseStep()", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        19,
        18,
        17,
        16
    ])("triggers the required updates when its time to inhale using %d", (i) => {
        const currentRound = settingsModule.settings.currentRound;    
        const rounds = settingsModule.settings.rounds;
        const inhale = settingsModule.settings.inhale;    
        exerciseModule.performExerciseStep(i);    

        expect(settingsModule.settings.inhale).toBe(inhale - 1);
        expect(updateTitleSpy).toHaveBeenCalledWith(`Round ${currentRound} of ${rounds}`);
        expect(updateActionSpy).toHaveBeenCalledWith("Inhale");    
        expect(updateCountdownSpy).toHaveBeenCalledWith(`${inhale}`);    
    });

    test.each([
        15,
        14,
        13,
        12,
        11,
        10,
        9
    ])("triggers the required updates when its time to hold using %d", (i) => {
        const currentRound = settingsModule.settings.currentRound;    
        const rounds = settingsModule.settings.rounds;
        const hold = settingsModule.settings.hold;    
        exerciseModule.performExerciseStep(i);    

        expect(settingsModule.settings.hold).toBe(hold - 1);
        expect(updateTitleSpy).toHaveBeenCalledWith(`Round ${currentRound} of ${rounds}`);
        expect(updateActionSpy).toHaveBeenCalledWith("Hold");    
        expect(updateCountdownSpy).toHaveBeenCalledWith(`${hold}`);    
    });

    test.each([
        8,
        7,
        6,
        5,
        4,
        3,
        2,
        1
    ])("triggers the required updates when its time to exhale using %d", (i) => {
        const currentRound = settingsModule.settings.currentRound;    
        const rounds = settingsModule.settings.rounds;    
        const exhale = settingsModule.settings.exhale;    
        exerciseModule.performExerciseStep(i);    

        expect(settingsModule.settings.exhale).toBe(exhale - 1);
        expect(updateTitleSpy).toHaveBeenCalledWith(`Round ${currentRound} of ${rounds}`);
        expect(updateActionSpy).toHaveBeenCalledWith("Exhale");    
        expect(updateCountdownSpy).toHaveBeenCalledWith(`${exhale}`);    
    });    test.each([
        [19, "inhale"],
        [15, "hold"],
        [8, "exhale"]
    ])("plays the right audio cue when a phase begins at duration %d", (duration, cue) => {
        exerciseModule.performExerciseStep(duration);

        expect(playAudioCueSpy).toHaveBeenCalledWith(cue);
    });

    test.each([
        [19, "inhale-beep"],
        [18, "inhale-beep"],
        [17, "inhale-beep"],
        [16, "inhale-beep"],
        [15, "hold-beep"],
        [14, "hold-beep"],
        [13, "hold-beep"],
        [12, "hold-beep"],
        [11, "hold-beep"],
        [10, "hold-beep"],
        [9, "hold-beep"],
        [8, "exhale-beep"],
        [7, "exhale-beep"],
        [6, "exhale-beep"],
        [5, "exhale-beep"],
        [4, "exhale-beep"],
        [3, "exhale-beep"],
        [2, "exhale-beep"],
        [1, "exhale-beep"]
    ])("duration %d plays the phase beep on every tick of the phase", (duration, beep) => {
        exerciseModule.performExerciseStep(duration);

        expect(playAudioCueSpy).toHaveBeenCalledWith(beep);
    });

    test.each([
        [18, "inhale"],
        [14, "hold"],
        [7, "exhale"]
    ])("duration %d doesn't repeat the spoken cue mid-phase", (duration, voiceCue) => {
        exerciseModule.performExerciseStep(duration);

        expect(playAudioCueSpy).not.toHaveBeenCalledWith(voiceCue);
    });

    test("triggers the ready state on screen with the lets-begin cue on round 1", () => {
        exerciseModule.performExerciseStep(22);    
        
        expect(updateTitleSpy).toHaveBeenCalledWith("Ready");      
        expect(updateActionSpy).toHaveBeenCalledWith(""); 
        expect(updateCountdownSpy).toHaveBeenCalledWith("");
        expect(playAudioCueSpy).toHaveBeenCalledWith("lets-begin");
    });

    test("doesn't play the lets-begin cue after round 1", () => {
        const originalRound = settingsModule.settings.currentRound;
        settingsModule.settings.currentRound = 2;

        exerciseModule.performExerciseStep(22);

        expect(playAudioCueSpy).not.toHaveBeenCalledWith("lets-begin");
        settingsModule.settings.currentRound = originalRound;
    });    test("triggers the steady state on screen", () => {
        exerciseModule.performExerciseStep(21);    
        
        expect(updateTitleSpy).toHaveBeenCalledWith("Ready");      
        expect(updateActionSpy).toHaveBeenCalledWith("Steady"); 
        expect(updateCountdownSpy).toHaveBeenCalledWith("");
        expect(playAudioCueSpy).not.toHaveBeenCalled();
    });

    test("triggers the go state on screen", () => {
        exerciseModule.performExerciseStep(20);    
        
        expect(updateTitleSpy).toHaveBeenCalledWith("Ready");      
        expect(updateActionSpy).toHaveBeenCalledWith("Steady");    
        expect(updateCountdownSpy).toHaveBeenCalledWith("Go");
        expect(toggleCountdownClassSpy).toHaveBeenCalled();
        expect(playAudioCueSpy).not.toHaveBeenCalled();
    });

    test.each([
        23,
        24,
        25,
        -1,
        -2,
        -3,
    ])("doesn't update anything in the ui for values out of bounds %d", (i) => {
        const exerciseDuration = settingsModule.settings.exerciseDuration;    
        
        exerciseModule.performExerciseStep(i);    

        expect(settingsModule.settings.exerciseDuration).toBe(exerciseDuration);        
        expect(updateTitleSpy).not.toHaveBeenCalled();
        expect(updateActionSpy).not.toHaveBeenCalled();
        expect(updateCountdownSpy).not.toHaveBeenCalled();
        expect(playAudioCueSpy).not.toHaveBeenCalled();
    });
    
    test("triggers the required updates when times up and no more rounds to go", () => {
        settingsModule.settings.rounds = 1;    
        const currentRound = settingsModule.settings.currentRound;    
        exerciseModule.performExerciseStep(0);    
        
        expect(updateTitleSpy).toHaveBeenCalledWith(`Round ${currentRound} of ${settingsModule.settings.rounds}`);
        expect(resetExerciseSpy).toHaveBeenCalled();
        expect(clearExerciseIntervalSpy).toHaveBeenCalled();
        expect(settingsModule.settings.currentRound).toBe(currentRound + 1);
        expect(switchToExerciseCompleteModeSpy).toHaveBeenCalled();
        expect(playAudioCueSpy).toHaveBeenCalledWith("complete");
        expect(playAudioCueSpy).not.toHaveBeenCalledWith("next-round");
    });

    test("triggers the required updates when times up but more rounds to go", () => {
        settingsModule.settings.rounds = 5;    
        const currentRound = settingsModule.settings.currentRound;    
        exerciseModule.performExerciseStep(0);    
        
        expect(updateTitleSpy).toHaveBeenCalledWith(`Round ${currentRound} of ${settingsModule.settings.rounds}`);
        expect(resetExerciseSpy).toHaveBeenCalled();
        expect(clearExerciseIntervalSpy).toHaveBeenCalled();
        expect(settingsModule.settings.currentRound).toBe(currentRound + 1);

        expect(startExerciseSpy).toHaveBeenCalled();
        expect(switchToRoundCompleteModeSpy).toHaveBeenCalled();        
        expect(playAudioCueSpy).toHaveBeenCalledWith("next-round");
        expect(playAudioCueSpy).not.toHaveBeenCalledWith("complete");

        expect(switchToExerciseCompleteModeSpy).not.toHaveBeenCalled();
    });
});

