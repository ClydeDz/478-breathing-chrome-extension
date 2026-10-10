import * as uiModule from "./ui";
import * as settingsModule from "../scripts/settings";
import * as exerciseModule from "./exercise";
import * as audioModule from "./audio";

export function switchToRoundCompleteMode() {
  uiModule.updateTitle("");
  uiModule.updateAction(`Round ${settingsModule.settings.currentRound}`);
  uiModule.updateCountdown("");
}

export function switchToExerciseCompleteMode() {
  audioModule.stopAllAudio();
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
  settingsModule.settings.pauseBetweenRounds =
    uiModule.getPauseBetweenRoundsValue();
  uiModule.toggleHomeVisibility(false);
  uiModule.toggleExerciseInProgressVisibility(true);
  uiModule.toggleExerciseCompleteVisibility(false);
}

export function switchToHomeMode() {
  settingsModule.settings.currentRound = 1;
  settingsModule.clearExerciseInterval(settingsModule.intervalTimer);
  settingsModule.resetExercise();
  audioModule.stopAllAudio();

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
    settingsModule.settings.interval,
  );
}
