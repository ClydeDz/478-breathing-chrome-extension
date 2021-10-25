import jQuery from "jquery";

var rounds = 0;
var currentRound = 1;
var intervalTimer; 
var exerciseDuration = 19;

var exerciseSteps = {
    "inhale": 4,
    "hold": 7,
    "exhale": 8
};

function resetExercise() {
    exerciseSteps["inhale"] = 4;
    exerciseSteps["hold"] = 7;
    exerciseSteps["exhale"] = 8;
    exerciseDuration = 19;
}

function exerciseInhale() {
    jQuery("#exerciseAction").text(`INHALE`);
    jQuery("#exerciseCountdown").text(`${exerciseSteps["inhale"]}`);
    exerciseSteps["inhale"]--;
}

function exerciseHold(){
    jQuery("#exerciseAction").text(`HOLD`);
    jQuery("#exerciseCountdown").text(`${exerciseSteps["hold"]}`);
    exerciseSteps["hold"]--;
}

function exerciseExhale(){
    jQuery("#exerciseAction").text(`EXHALE`);
    jQuery("#exerciseCountdown").text(`${exerciseSteps["exhale"]}`);
    exerciseSteps["exhale"]--;    
}

function startExercise() {
    jQuery("#exerciseTitle").text(`Round ${currentRound} of ${rounds}`);
    intervalTimer = setInterval(function(){
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
            resetExercise();
            clearInterval(intervalTimer);
            currentRound++;

            if(currentRound <= rounds) {
                startExercise();
            }

            return;
        }

        --exerciseDuration;  
    }, 1000);
}

function switchToExerciseMode() {
    rounds = jQuery("#roundsSelection").val();
    jQuery("#home").hide();
    jQuery("#exercise").show();
    jQuery("#exerciseTitle").text(`Round ${currentRound} of ${rounds}`);
}

function switchToHomeMode() {
    currentRound = 1;
    jQuery("#home").show();
    jQuery("#exercise").hide();
    clearInterval(intervalTimer);
    resetExercise();
}

jQuery(function() {
    jQuery("#start").on("click", function() {        
        switchToExerciseMode();
        startExercise();
    });

    jQuery("#exerciseEnd").on("click", function() {        
        switchToHomeMode();
    });
});
