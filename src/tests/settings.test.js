import * as settingsModule from "../scripts/settings";

jest.useFakeTimers();
jest.spyOn(global, "clearInterval");

describe("settings → resetExercise()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("resets all settings back to start from initial", () => {
        settingsModule.resetExercise();
        
        expect(settingsModule.settings.inhale).toBe(4);
        expect(settingsModule.settings.hold).toBe(7);
        expect(settingsModule.settings.exhale).toBe(8);
        expect(settingsModule.settings.exerciseDuration).toBe(22);
    });

    test("resets all settings back to start from another value", () => {
        settingsModule.settings.inhale = 50;
        settingsModule.settings.hold = 100;
        settingsModule.settings.exhale = 55;
        settingsModule.settings.exerciseDuration = 150;

        settingsModule.resetExercise();
        
        expect(settingsModule.settings.inhale).toBe(4);
        expect(settingsModule.settings.hold).toBe(7);
        expect(settingsModule.settings.exhale).toBe(8);
        expect(settingsModule.settings.exerciseDuration).toBe(22);
    });
});

describe("settings → clearExerciseInterval()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("clears interval timer from initial", () => {
        settingsModule.clearExerciseInterval();        

        expect(clearInterval).toHaveBeenCalledWith(0);
    });
    
    test("clears interval timer from another value", () => {
        settingsModule.intervalTimer = setInterval(jest.fn(), 1000);
        settingsModule.clearExerciseInterval();      

        // TODO: Explore why this value is 0
        expect(clearInterval).toHaveBeenCalledWith(0);
    });
});