import * as actionsModule from "./actions";
var jQuery;

export const initializeJQuery = (jQueryInstance) => {
    jQuery = jQueryInstance;
}

export const startButtonTrigger = () => {
    actionsModule.switchToExerciseInProgressMode();
    actionsModule.startExercise();
}

export const completeButtonTrigger = () => {
    actionsModule.switchToHomeMode();
}

export const initTriggers = () => {
    jQuery("#start").on("click", startButtonTrigger);
    jQuery("#exerciseEnd, #exerciseCompleteToHome").on("click", completeButtonTrigger);
}

function updateElementText(element, text) {
    element.text(text);
}

export const updateAction = (value) => {
    updateElementText(jQuery("#exerciseAction"), value);
}

export const updateCountdown = (value) => {
    updateElementText(jQuery("#exerciseCountdown"), value);
}

export const updateTitle = (value) => {
    updateElementText(jQuery("#exerciseTitle"), value);
}

export const getRoundDropdownValue = () => {
    return jQuery("#roundsSelection").val();
}

function toggleElementVisibility(element, showComponent) {
    showComponent ? element.show(): element.hide();
}

export const toggleHomeVisibility = (showComponent) => {
    const element = jQuery("#home");
    toggleElementVisibility(element, showComponent);
}

export const toggleExerciseInProgressVisibility = (showComponent) => {
    const element = jQuery("#exerciseInProgress");
    toggleElementVisibility(element, showComponent);
}

export const toggleExerciseCompleteVisibility = (showComponent) => {
    const element = jQuery("#exerciseComplete");
    toggleElementVisibility(element, showComponent);
}
