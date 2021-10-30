import * as uiModule from "../scripts/uiModule";
import * as settingsModule from "../scripts/settings";
import * as exerciseStepsModule from "../scripts/exerciseSteps";

export function switchToExerciseCompleteMode() {
    uiModule.toggleHomeVisibility(false);
    uiModule.toggleExerciseInProgressVisibility(false);
    uiModule.toggleExerciseCompleteVisibility(true);
    uiModule.resetRoundDropdownValue();
    
    uiModule.updateAction("");
    uiModule.updateTitle("");
    uiModule.updateCountdown("");
}

export function switchToExerciseInProgressMode() {
    settingsModule.settings.rounds = uiModule.getRoundDropdownValue();
    uiModule.toggleHomeVisibility(false);
    uiModule.toggleExerciseInProgressVisibility(true);
    uiModule.toggleExerciseCompleteVisibility(false);
    uiModule.updateTitle(`Round ${settingsModule.settings.currentRound} of ${settingsModule.settings.rounds}`);
}

export function switchToHomeMode() {
    settingsModule.settings.currentRound = 1;
    settingsModule.clearExerciseInterval();
    settingsModule.resetExercise();
    
    uiModule.toggleHomeVisibility(true);
    uiModule.toggleExerciseInProgressVisibility(false);
    uiModule.toggleExerciseCompleteVisibility(false);   
    
    uiModule.updateAction("");
    uiModule.updateTitle("");
    uiModule.updateCountdown("");
}

export function startExerciseIntervalFunction() {
    exerciseStepsModule.performExerciseStep(settingsModule.settings.exerciseDuration);
    --settingsModule.settings.exerciseDuration; 
}

export function startExercise() {
    uiModule.updateTitle(`Round ${settingsModule.settings.currentRound} of ${settingsModule.settings.rounds}`);

    settingsModule.intervalTimer = setInterval(
        startExerciseIntervalFunction, 
        settingsModule.settings.interval
        );
}
