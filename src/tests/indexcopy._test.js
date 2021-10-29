import * as uiModule from "../scripts/uiModule";

const main = require("../scripts/index");
const jQuery = require("./__mocks__/jquery").jQuery;

global.jQuery = jQuery;

describe('main code two', () => {   

    const exerciseInhaleSpy = jest.spyOn(main, "exerciseInhale")
        .mockImplementation(() => {
            console.log("mockkkkkkkkkkk")
            return;
        });

    //main.exerciseInhale = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('inhale', () => {
        main.performExerciseStep(18);    
        expect(exerciseInhaleSpy).toHaveBeenCalled();    
    });
});




