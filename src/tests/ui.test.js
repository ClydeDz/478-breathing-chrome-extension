import * as uiModule from "../scripts/uiModule";

const text = jest.fn();
const jQuery = jest.fn(() => ({
    text
}));

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
