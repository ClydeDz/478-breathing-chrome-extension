import * as uiModule from "../scripts/uiModule";
import * as exerciseStepsModule from "../scripts/exerciseSteps";
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

// TODO: Add other repetitive tests

describe('exerciseSteps → performExerciseStep()', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('triggers the required updates when its time to inhale', () => {
        const inhale = settingsModule.settings.inhale;    
        exerciseStepsModule.performExerciseStep(18);    

        expect(settingsModule.settings.inhale).toBe(inhale - 1);
        expect(updateActionSpy).toHaveBeenCalledWith("Inhale");    
        expect(updateCountdownSpy).toHaveBeenCalledWith(`${inhale}`);    
    });

    test('triggers the...', () => {
        settingsModule.settings.rounds = 1;    
        const currentRound = settingsModule.settings.currentRound;    
        exerciseStepsModule.performExerciseStep(0);    
        
        expect(resetExerciseSpy).toHaveBeenCalled();
        expect(clearExerciseIntervalSpy).toHaveBeenCalled();
        expect(settingsModule.settings.currentRound).toBe(currentRound + 1);
        expect(switchToExerciseCompleteModeSpy).toHaveBeenCalled();
    });

    test('triggers the excp...', () => {
        settingsModule.settings.rounds = 5;    
        const currentRound = settingsModule.settings.currentRound;    
        exerciseStepsModule.performExerciseStep(0);    
        
        expect(resetExerciseSpy).toHaveBeenCalled();
        expect(clearExerciseIntervalSpy).toHaveBeenCalled();
        expect(settingsModule.settings.currentRound).toBe(currentRound + 1);

        expect(startExerciseSpy).toHaveBeenCalled();

        expect(switchToExerciseCompleteModeSpy).not.toHaveBeenCalled();
    });
});

