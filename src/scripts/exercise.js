import * as uiModule from "./ui";
import * as settingsModule from "./settings";
import * as actionsModule from "./actions";

function exerciseInhale() {
    uiModule.updateAction("Inhale");
    uiModule.updateCountdown(`${settingsModule.settings.inhale}`);
    settingsModule.settings.inhale--;
}

function exerciseHold(){
    uiModule.updateAction("Hold");
    uiModule.updateCountdown(`${settingsModule.settings.hold}`);
    settingsModule.settings.hold--;
}

function exerciseExhale(){
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
            actionsModule.startExercise();
            return;
        }

        actionsModule.switchToExerciseCompleteMode()
        return;
    }
}
