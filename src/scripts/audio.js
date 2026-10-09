export const AUDIO_SOURCES = {
    "lets-begin": "./audio/lets-begin.mp3",
    inhale: "./audio/inhale.mp3",
    hold: "./audio/hold.mp3",
    exhale: "./audio/exhale.mp3",
    "inhale-beep": "./audio/inhale-beep.mp3",
    "hold-beep": "./audio/hold-beep.mp3",
    "exhale-beep": "./audio/exhale-beep.mp3",
    "next-round": "./audio/next-round.mp3",
    complete: "./audio/complete.mp3"
};

let audioEnabled = false;
let audioElements = {};
let audioFactory = null;

export const initializeAudio = (audioFactoryInstance) => {
    audioFactory = audioFactoryInstance;
};

function createAudioElement(source) {
    if (audioFactory) return audioFactory(source);
    if (typeof Audio === "undefined") return null;

    const element = new Audio(source);
    element.preload = "auto";
    return element;
}

function getAudioElement(cue) {
    if (!audioElements[cue]) {
        audioElements[cue] = createAudioElement(AUDIO_SOURCES[cue]);
    }
    return audioElements[cue];
}

function restartAndPlay(element) {
    if (!element) return;

    try {
        element.currentTime = 0;
        const playPromise = element.play();
        if (playPromise && typeof playPromise.catch === "function") {
            // Browsers may reject play() due to autoplay policies. Audio is a
            // progressive enhancement, so a rejection should never break the exercise.
            playPromise.catch(() => {});
        }
    } catch (error) {
        // Same reasoning as above: keep the exercise going even if audio fails.
    }
}

// Eagerly create (and thereby fetch, via preload="auto") every audio element.
// Doing this at toggle time means the first cue of the exercise doesn't pay the
// one-time cost of creating/fetching an element while it should already be audible.
function preloadAudio() {
    Object.keys(AUDIO_SOURCES).forEach((cue) => getAudioElement(cue));
}

export const isAudioEnabled = () => audioEnabled;

export const toggleAudio = () => {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
        preloadAudio();
    } else {
        stopAllAudio();
    }
    return audioEnabled;
};

export const playAudioCue = (cue) => {
    if (!audioEnabled || !AUDIO_SOURCES[cue]) return;
    restartAndPlay(getAudioElement(cue));
};

export const stopAllAudio = () => {
    Object.keys(audioElements).forEach((cue) => {
        const element = audioElements[cue];
        if (!element) return;

        try {
            element.pause();
            element.currentTime = 0;
        } catch (error) {
            // Ignore elements that can't be paused; nothing else to clean up.
        }
    });
};
