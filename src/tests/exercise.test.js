import * as uiModule from "../scripts/ui";
import * as exerciseModule from "../scripts/exercise";
import * as settingsModule from "../scripts/settings";
import * as actionModule from "../scripts/actions";

const updateActionSpy = jest.spyOn(uiModule, "updateAction")
    .mockImplementation(jest.fn());
const updateCountdownSpy = jest.spyOn(uiModule, "updateCountdown")
    .mockImplementation(jest.fn());

const resetExerciseSpy = jest.spyOn(settingsModule, "resetExercise")
    .mockImplementation(jest.fn());
const clearExerciseIntervalSpy = jest.spyOn(settingsModule, "clearExerciseInterval")
    .mockImplementation(jest.fn());

const switchToExerciseCompleteModeSpy = jest.spyOn(actionModule, "switchToExerciseCompleteMode")
    .mockImplementation(jest.fn());
const startExerciseSpy = jest.spyOn(actionModule, "startExercise")
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
        const inhale = settingsModule.settings.inhale;    
        exerciseModule.performExerciseStep(i);    

        expect(settingsModule.settings.inhale).toBe(inhale - 1);
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
        const hold = settingsModule.settings.hold;    
        exerciseModule.performExerciseStep(i);    

        expect(settingsModule.settings.hold).toBe(hold - 1);
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
        const exhale = settingsModule.settings.exhale;    
        exerciseModule.performExerciseStep(i);    

        expect(settingsModule.settings.exhale).toBe(exhale - 1);
        expect(updateActionSpy).toHaveBeenCalledWith("Exhale");    
        expect(updateCountdownSpy).toHaveBeenCalledWith(`${exhale}`);    
    });
    
    test("triggers the required updates when times up and no more rounds to go", () => {
        settingsModule.settings.rounds = 1;    
        const currentRound = settingsModule.settings.currentRound;    
        exerciseModule.performExerciseStep(0);    
        
        expect(resetExerciseSpy).toHaveBeenCalled();
        expect(clearExerciseIntervalSpy).toHaveBeenCalled();
        expect(settingsModule.settings.currentRound).toBe(currentRound + 1);
        expect(switchToExerciseCompleteModeSpy).toHaveBeenCalled();
    });

    test("triggers the required updates when times up but more rounds to go", () => {
        settingsModule.settings.rounds = 5;    
        const currentRound = settingsModule.settings.currentRound;    
        exerciseModule.performExerciseStep(0);    
        
        expect(resetExerciseSpy).toHaveBeenCalled();
        expect(clearExerciseIntervalSpy).toHaveBeenCalled();
        expect(settingsModule.settings.currentRound).toBe(currentRound + 1);

        expect(startExerciseSpy).toHaveBeenCalled();

        expect(switchToExerciseCompleteModeSpy).not.toHaveBeenCalled();
    });
});

