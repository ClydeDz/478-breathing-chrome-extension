import jQuery from "jquery";

export const updateAction = (value) => {
    jQuery("#exerciseAction").text(value);
}

export const updateCountdown = (value) => {
    jQuery("#exerciseCountdown").text(value);
}

export const updateTitle = (value) => {
    jQuery("#exerciseTitle").text(value);
}

export const getRoundDropdownValue = () => {
    return jQuery("#roundsSelection").val();
}

export const toggleHomeVisibility = (showComponent) => {
    const element = jQuery("#home");
    showComponent ? element.show(): element.hide();
}

export const toggleExerciseInProgressVisibility = (showComponent) => {
    const element = jQuery("#exerciseInProgress");
    showComponent ? element.show(): element.hide();
}

export const toggleExerciseCompleteVisibility = (showComponent) => {
    const element = jQuery("#exerciseComplete");
    showComponent ? element.show(): element.hide();
}
