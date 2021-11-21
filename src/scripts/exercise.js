import * as uiModule from "./ui";
import * as settingsModule from "./settings";
import * as actionsModule from "./actions";

function exerciseReady() {
    uiModule.updateTitle("Ready");
    uiModule.updateAction("");
    uiModule.updateCountdown("");
}

function exerciseSteady() {
    uiModule.updateTitle("Ready");
    uiModule.updateAction("Steady");
    uiModule.updateCountdown("");
}

function exerciseGo() {
    uiModule.toggleCountdownClass();
    uiModule.updateTitle("Ready");
    uiModule.updateAction("Steady");
    uiModule.updateCountdown("Go");
    uiModule.toggleCountdownClass();
}

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
    if(exerciseDuration === 22) {
        exerciseReady();
    }
    
    if(exerciseDuration === 21) {
        exerciseSteady();
    }

    if(exerciseDuration === 20) {
        exerciseGo();
    }

    if(exerciseDuration < 20 && exerciseDuration >= 0) {
        uiModule.updateTitle(`Round ${settingsModule.settings.currentRound} of ${settingsModule.settings.rounds}`);
    }    

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
        ++settingsModule.settings.currentRound;        
        settingsModule.clearExerciseInterval(settingsModule.intervalTimer);
        settingsModule.resetExercise();

        if(settingsModule.settings.currentRound <= settingsModule.settings.rounds) {
            actionsModule.switchToRoundCompleteMode();
            actionsModule.startExercise();
            return;
        }
        
        actionsModule.switchToExerciseCompleteMode()
        return;
    }

    if(exerciseDuration <= 22 && exerciseDuration > 0) {
        --settingsModule.settings.exerciseDuration; 
    }    
}
