import * as uiModule from "../scripts/uiModule";

const main = require("../scripts/index");
const jQuery = require("./__mocks__/jquery").jQuery;

global.jQuery = jQuery;

const updateActionSpy = jest.spyOn(uiModule, "updateAction")
    .mockImplementation(jest.fn());

const updateCountdownSpy = jest.spyOn(uiModule, "updateCountdown")
    .mockImplementation(jest.fn());

describe('main code', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('inhale', () => {
        const inhale = main.exerciseSteps.inhale;    
        main.exerciseInhale();    
        expect(main.exerciseSteps.inhale).toBe(inhale - 1);
        expect(updateActionSpy).toHaveBeenCalledWith("Inhale");    
        expect(updateCountdownSpy).toHaveBeenCalled();    
    });
});
