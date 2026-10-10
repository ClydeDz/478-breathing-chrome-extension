import * as uiModule from "./ui";
import * as settingsModule from "./settings";
import * as actionsModule from "./actions";
import * as audioModule from "./audio";

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

export function performExerciseStep(exerciseDuration) {
    if(exerciseDuration >= 0 && exerciseDuration < 20) {
        uiModule.updateTitle(`Round ${settingsModule.settings.currentRound} of ${settingsModule.settings.rounds}`);
    }  

    if(exerciseDuration === 22) {
        if(settingsModule.settings.currentRound === 1) {
            audioModule.playAudioCue("lets-begin");
        }
        exerciseReady();
    }
    
    if(exerciseDuration === 21) {
        exerciseSteady();
    }

    if(exerciseDuration === 20) {
        exerciseGo();
    }      

    if(exerciseDuration === 19) {
        audioModule.playAudioCue("inhale");
    }

    if(exerciseDuration >= 16 && exerciseDuration <=19) {
        audioModule.playAudioCue("inhale-beep");
        exerciseInhale();
    }

    if(exerciseDuration === 15) {
        audioModule.playAudioCue("hold");
    }

    if(exerciseDuration >= 9 && exerciseDuration <=15) {
        audioModule.playAudioCue("hold-beep");
        exerciseHold();
    }

    if(exerciseDuration === 8) {
        audioModule.playAudioCue("exhale");
    }

    if(exerciseDuration >= 1 && exerciseDuration <=8) {
        audioModule.playAudioCue("exhale-beep");
        exerciseExhale();
    }        

    if(exerciseDuration == 0) {
        ++settingsModule.settings.currentRound;        
        settingsModule.clearExerciseInterval(settingsModule.intervalTimer);
        settingsModule.resetExercise();

        if(settingsModule.settings.currentRound <= settingsModule.settings.rounds) {
            if(settingsModule.settings.pauseBetweenRounds) {
                audioModule.playAudioCue("next-round");
                actionsModule.switchToRoundCompleteMode();
            } else {
                // No pause: skip the round-complete screen and the
                // Ready/Steady/Go lead-in, and flow straight from this
                // exhale into the next round's inhale. The duration-19 step
                // owns the spoken "inhale" cue and the first count of 4; it
                // leaves exerciseDuration at 18, so the next tick continues
                // the countdown at 3.
                settingsModule.settings.exerciseDuration = 19;
                performExerciseStep(19);
            }
            actionsModule.startExercise();
            return;
        }
        
        actionsModule.switchToExerciseCompleteMode()
        // After the mode switch: it stops lingering audio, so the completion
        // cue has to be played afterwards to actually be heard.
        audioModule.playAudioCue("complete");
        return;
    }

    if(exerciseDuration < 0 || exerciseDuration > 22) return;
    
    --settingsModule.settings.exerciseDuration;    
}
