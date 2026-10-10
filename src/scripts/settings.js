export var intervalTimer = 0;

export var settings = {
  inhale: 4,
  hold: 7,
  exhale: 8,
  rounds: 1,
  currentRound: 1,
  exerciseDuration: 22,
  interval: 1000,
  pauseBetweenRounds: false,
};

export function resetExercise() {
  settings.inhale = 4;
  settings.hold = 7;
  settings.exhale = 8;
  settings.exerciseDuration = 22;
}

// Callers pass the id they stored via the module (startExercise() assigns it
// through the namespace, which never reaches the local variable below), so
// clearing uses that id; the local fallback keeps no-arg calls working.
export function clearExerciseInterval(timerId = intervalTimer) {
  clearInterval(timerId);
}
