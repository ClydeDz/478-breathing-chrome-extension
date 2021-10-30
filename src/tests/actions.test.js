import * as uiModule from "../scripts/uiModule";
import * as actionsModule from "../scripts/actions";
import * as settingsModule from "../scripts/settings";
import * as exerciseStepsModule from "../scripts/exerciseSteps";

const updateActionSpy = jest.spyOn(uiModule, "updateAction")
    .mockImplementation(jest.fn());
const updateCountdownSpy = jest.spyOn(uiModule, "updateCountdown")
    .mockImplementation(jest.fn());
const updateTitleSpy = jest.spyOn(uiModule, "updateTitle")
    .mockImplementation(jest.fn());
const resetRoundDropdownValueSpy = jest.spyOn(uiModule, "resetRoundDropdownValue")
    .mockImplementation(jest.fn());
const toggleHomeVisibilitySpy = jest.spyOn(uiModule, "toggleHomeVisibility")
    .mockImplementation(jest.fn());
const toggleExerciseInProgressVisibilitySpy = jest.spyOn(uiModule, "toggleExerciseInProgressVisibility")
    .mockImplementation(jest.fn());
const toggleExerciseCompleteVisibilitySpy = jest.spyOn(uiModule, "toggleExerciseCompleteVisibility")
    .mockImplementation(jest.fn());
const getRoundDropdownValueSpy = jest.spyOn(uiModule, "getRoundDropdownValue")
    .mockImplementation(jest.fn());

const clearExerciseIntervalSpy = jest.spyOn(settingsModule, "clearExerciseInterval")
    .mockImplementation(jest.fn());
const resetExerciseSpy = jest.spyOn(settingsModule, "resetExercise")
    .mockImplementation(jest.fn());

const performExerciseStepSpy = jest.spyOn(exerciseStepsModule, "performExerciseStep")
    .mockImplementation(jest.fn());

describe('actions → switchToExerciseCompleteMode()', () => {    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('updates required ui elements', () => {
        actionsModule.switchToExerciseCompleteMode();
        
        expect(toggleHomeVisibilitySpy).toHaveBeenCalledWith(false);    
        expect(toggleExerciseInProgressVisibilitySpy).toHaveBeenCalledWith(false);    
        expect(toggleExerciseCompleteVisibilitySpy).toHaveBeenCalledWith(true);    
        expect(resetRoundDropdownValueSpy).toHaveBeenCalled();

        expect(updateActionSpy).toHaveBeenCalledWith("");    
        expect(updateCountdownSpy).toHaveBeenCalledWith("");    
        expect(updateTitleSpy).toHaveBeenCalledWith("");    
    });
});

describe('actions → switchToExerciseInProgressMode()', () => {    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('updates required ui elements', () => {
        getRoundDropdownValueSpy.mockReturnValue(5);

        actionsModule.switchToExerciseInProgressMode();
        const expectedText = `Round 1 of 5`;
        
        expect(getRoundDropdownValueSpy).toHaveBeenCalled();    
        expect(toggleHomeVisibilitySpy).toHaveBeenCalledWith(false);    
        expect(toggleExerciseInProgressVisibilitySpy).toHaveBeenCalledWith(true);    
        expect(toggleExerciseCompleteVisibilitySpy).toHaveBeenCalledWith(false);    

        expect(updateActionSpy).not.toHaveBeenCalled();    
        expect(updateCountdownSpy).not.toHaveBeenCalled();
        expect(updateTitleSpy).toHaveBeenCalledWith(expectedText);    
    });
});

describe('actions → switchToHomeMode()', () => {    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('updates required ui elements', () => {
        actionsModule.switchToHomeMode();
        
        expect(settingsModule.settings.currentRound).toBe(1);
        expect(clearExerciseIntervalSpy).toHaveBeenCalled();
        expect(resetExerciseSpy).toHaveBeenCalled();

        expect(toggleHomeVisibilitySpy).toHaveBeenCalledWith(true);    
        expect(toggleExerciseInProgressVisibilitySpy).toHaveBeenCalledWith(false);
        expect(toggleExerciseCompleteVisibilitySpy).toHaveBeenCalledWith(false);

        expect(updateActionSpy).toHaveBeenCalledWith("");    
        expect(updateCountdownSpy).toHaveBeenCalledWith("");    
        expect(updateTitleSpy).toHaveBeenCalledWith("");  
    });
});

describe('actions → startExercise()', () => {    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('updates required ui elements', () => {
        settingsModule.settings.rounds = 5;        
        const interval = settingsModule.settings.interval;
        jest.useFakeTimers();
        jest.spyOn(global, "setInterval");

        actionsModule.startExercise();
        
        expect(updateTitleSpy).toHaveBeenCalledWith(`Round 1 of 5`);  
        expect(setInterval).toHaveBeenCalledWith(actionsModule.startExerciseIntervalFunction, interval);
    });
});


describe('actions → startExerciseIntervalFunction()', () => {    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('updates required ui elements', () => {
        const duration = settingsModule.settings.exerciseDuration;

        actionsModule.startExerciseIntervalFunction();

        expect(performExerciseStepSpy).toHaveBeenCalledWith(duration);  
        expect(settingsModule.settings.exerciseDuration).toBe(duration - 1);
    });
});

