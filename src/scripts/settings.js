export var intervalTimer = 0;

export var settings = {
    inhale: 4,
    hold: 7,
    exhale: 8,    
    rounds: 1,
    currentRound: 1,    
    exerciseDuration: 22,
    interval: 1000
};

export function resetExercise() {
    settings.inhale = 4;
    settings.hold = 7;
    settings.exhale = 8;
    settings.exerciseDuration = 22;
}

export function clearExerciseInterval() {
    clearInterval(intervalTimer);
}
