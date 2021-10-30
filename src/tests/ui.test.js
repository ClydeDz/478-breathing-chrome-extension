import * as uiModule from "../scripts/uiModule";
import * as actionModule from "../scripts/actions";
import { 
    jQuery, 
    text,
    hide,
    show,
    on,
    val
 } from "./mocks/jqueryMock";

const switchToExerciseInProgressModeSpy = jest.spyOn(actionModule, "switchToExerciseInProgressMode")
    .mockImplementation(jest.fn());
const startExerciseSpy = jest.spyOn(actionModule, "startExercise")
    .mockImplementation(jest.fn());
const switchToHomeModeSpy = jest.spyOn(actionModule, "switchToHomeMode")
    .mockImplementation(jest.fn());

describe("ui → initTriggers()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("binds triggers", () => {
        uiModule.initTriggers();
        expect(jQuery).toHaveBeenCalledWith("#start");
        expect(jQuery).toHaveBeenCalledWith("#exerciseEnd, #exerciseCompleteToHome");
        expect(on).toHaveBeenCalledTimes(2);
        expect(on).toHaveBeenCalledWith("click", uiModule.startButtonTrigger);
        expect(on).toHaveBeenLastCalledWith("click", uiModule.completeButtonTrigger);
    });
});

describe("ui → startButtonTrigger()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("binds triggers", () => {
        uiModule.startButtonTrigger();
        expect(switchToExerciseInProgressModeSpy).toHaveBeenCalled();
        expect(startExerciseSpy).toHaveBeenCalled();
    });
});

describe("ui → completeButtonTrigger()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("binds triggers", () => {
        uiModule.completeButtonTrigger();
        expect(switchToHomeModeSpy).toHaveBeenCalled();
    });
});

describe("ui → updateAction()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("updates the correct ui element", () => {
        uiModule.updateAction("Reset");
        expect(jQuery).toHaveBeenCalledWith("#exerciseAction");
        expect(text).toHaveBeenCalledWith("Reset");
    });
});

describe("ui → updateCountdown()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("updates the correct ui element", () => {
        uiModule.updateCountdown("Reset");
        expect(jQuery).toHaveBeenCalledWith("#exerciseCountdown");
        expect(text).toHaveBeenCalledWith("Reset");
    });
});

describe("ui → updateTitle()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("updates the correct ui element", () => {
        uiModule.updateTitle("Reset");
        expect(jQuery).toHaveBeenCalledWith("#exerciseTitle");
        expect(text).toHaveBeenCalledWith("Reset");
    });
});

describe("ui → getRoundDropdownValue()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("gets the value of a dropdown element", () => {
        const value = uiModule.getRoundDropdownValue();
        expect(jQuery).toHaveBeenCalledWith("#roundsSelection");
        expect(value).toBe(3);
    });
});

describe("ui → resetRoundDropdownValue()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("resets the value of a dropdown element", () => {
        uiModule.resetRoundDropdownValue();
        expect(jQuery).toHaveBeenCalledWith("#roundsSelection");
        expect(val).toHaveBeenCalledWith("1");
    });
});

describe("ui → toggleHomeVisibility()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("shows the element if true is supplied", () => {
        uiModule.toggleHomeVisibility(true);
        expect(jQuery).toHaveBeenCalledWith("#home");
        expect(show).toHaveBeenCalled();
    });

    test("hides the element if false is supplied", () => {
        uiModule.toggleHomeVisibility(false);
        expect(jQuery).toHaveBeenCalledWith("#home");
        expect(hide).toHaveBeenCalled();
    });
});

describe("ui → toggleExerciseInProgressVisibility()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("shows the element if true is supplied", () => {
        uiModule.toggleExerciseInProgressVisibility(true);
        expect(jQuery).toHaveBeenCalledWith("#exerciseInProgress");
        expect(show).toHaveBeenCalled();
    });

    test("hides the element if false is supplied", () => {
        uiModule.toggleExerciseInProgressVisibility(false);
        expect(jQuery).toHaveBeenCalledWith("#exerciseInProgress");
        expect(hide).toHaveBeenCalled();
    });
});

describe("ui → toggleExerciseCompleteVisibility()", () => {    
    beforeEach(() => {
        jest.clearAllMocks();
        uiModule.initializeJQuery(jQuery);
    });

    test("shows the element if true is supplied", () => {
        uiModule.toggleExerciseCompleteVisibility(true);
        expect(jQuery).toHaveBeenCalledWith("#exerciseComplete");
        expect(show).toHaveBeenCalled();
    });

    test("hides the element if false is supplied", () => {
        uiModule.toggleExerciseCompleteVisibility(false);
        expect(jQuery).toHaveBeenCalledWith("#exerciseComplete");
        expect(hide).toHaveBeenCalled();
    });
});
