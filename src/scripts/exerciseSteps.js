import * as uiModule from "../scripts/uiModule";
import * as settingsModule from "../scripts/settings";
import * as actionsModule from "../scripts/actions";

export function exerciseInhale() {
    uiModule.updateAction("Inhale");
    uiModule.updateCountdown(`${settingsModule.settings.inhale}`);
    settingsModule.settings.inhale--;
}

export function exerciseHold(){
    uiModule.updateAction("Hold");
    uiModule.updateCountdown(`${settingsModule.settings.hold}`);
    settingsModule.settings.hold--;
}

export function exerciseExhale(){
    uiModule.updateAction("Exhale");
    uiModule.updateCountdown(`${settingsModule.settings.exhale}`);
    settingsModule.settings.exhale--;
}

export function performExerciseStep(exerciseDuration){
    if(exerciseDuration <=19 && exerciseDuration >= 16) {
        exerciseInhale();
    }

    if(exerciseDuration <=15 && exerciseDuration >= 9) {
        exerciseHold();
    }

    if(exerciseDuration <=8 && exerciseDuration >= 1) {
        exerciseExhale();
    }        

    if(exerciseDuration == 0) {
        settingsModule.resetExercise();
        settingsModule.clearExerciseInterval(settingsModule.intervalTimer);
        ++settingsModule.settings.currentRound;

        if(settingsModule.settings.currentRound <= settingsModule.settings.rounds) {
            startExercise();
            return;
        }

        actionsModule.switchToExerciseCompleteMode()
        return;
    }
}

export function startExercise() {
    uiModule.updateTitle(`Round ${settingsModule.settings.currentRound} of ${settingsModule.settings.rounds}`);

    settingsModule.intervalTimer = setInterval(function() {
        performExerciseStep(settingsModule.settings.exerciseDuration);
        --settingsModule.settings.exerciseDuration;  
    }, settingsModule.settings.interval);
}
