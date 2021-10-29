import jQuery from "jquery";
import * as exerciseStepsModule from "../scripts/exerciseSteps";
import * as actionsModule from "../scripts/actions";
import * as uiModule from "../scripts/uiModule";

jQuery(function() {
    uiModule.initializeJQuery(jQuery);

    jQuery("#start").on("click", function() {        
        actionsModule.switchToExerciseInProgressMode();
        exerciseStepsModule.startExercise();
    });

    jQuery("#exerciseEnd, #exerciseCompleteToHome").on("click", function() {        
        actionsModule.switchToHomeMode();
    });
});
