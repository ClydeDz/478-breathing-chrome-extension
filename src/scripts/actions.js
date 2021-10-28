import * as uiModule from "../scripts/uiModule";
import * as settingsModule from "../scripts/settings";

export function switchToExerciseCompleteMode() {
    uiModule.toggleHomeVisibility(false);
    uiModule.toggleExerciseInProgressVisibility(false);
    uiModule.toggleExerciseCompleteVisibility(true);
    
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
