import * as uiModule from "./ui";
import * as settingsModule from "../scripts/settings";
import * as exerciseModule from "./exercise";

export function switchToRoundCompleteMode() {
    uiModule.updateTitle("");
    uiModule.updateAction(`Round ${settingsModule.settings.currentRound}`);
    uiModule.updateCountdown("");
}

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
    uiModule.resetRoundDropdownValue();
    
    uiModule.updateAction("");
    uiModule.updateTitle("");
    uiModule.updateCountdown("");
}

export function startExerciseIntervalFunction() {
    exerciseModule.performExerciseStep(settingsModule.settings.exerciseDuration);    
}

export function startExercise() {
    settingsModule.intervalTimer = setInterval(
        startExerciseIntervalFunction, 
        settingsModule.settings.interval
        );
}
