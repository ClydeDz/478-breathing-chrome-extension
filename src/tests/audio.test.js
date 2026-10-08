const createdElements = [];
const playedCurrentTimes = [];

const audioFactory = jest.fn((source) => {
    const element = {
        source,
        currentTime: 0,
        play: jest.fn(() => {
            playedCurrentTimes.push(element.currentTime);
            return Promise.resolve();
        }),
        pause: jest.fn()
    };
    createdElements.push(element);
    return element;
});

let audioModule;

describe("audio module", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        createdElements.length = 0;
        playedCurrentTimes.length = 0;
        audioModule = require("../scripts/audio");
        audioModule.initializeAudio(audioFactory);
    });

    test("starts with audio disabled", () => {
        expect(audioModule.isAudioEnabled()).toBe(false);
    });

    test("toggleAudio() turns audio on", () => {
        expect(audioModule.toggleAudio()).toBe(true);
        expect(audioModule.isAudioEnabled()).toBe(true);
    });

    test("toggleAudio() turns audio back off", () => {
        audioModule.toggleAudio();
        expect(audioModule.toggleAudio()).toBe(false);
        expect(audioModule.isAudioEnabled()).toBe(false);
    });

    test("doesn't create or play any audio while disabled", () => {
        audioModule.playAudioCue("inhale");
        audioModule.playTick();

        expect(audioFactory).not.toHaveBeenCalled();
        expect(createdElements).toHaveLength(0);
    });

    test("creates an audio element per cue and plays it when enabled", () => {
        audioModule.toggleAudio();

        audioModule.playAudioCue("inhale");
        audioModule.playAudioCue("hold");
        audioModule.playAudioCue("exhale");
        audioModule.playTick();

        expect(audioFactory).toHaveBeenCalledTimes(4);
        expect(audioFactory).toHaveBeenCalledWith("./audio/inhale.mp3");
        expect(audioFactory).toHaveBeenCalledWith("./audio/hold.mp3");
        expect(audioFactory).toHaveBeenCalledWith("./audio/exhale.mp3");
        expect(audioFactory).toHaveBeenCalledWith("./audio/clock-one-tick.mp3");
        expect(createdElements).toHaveLength(4);
        createdElements.forEach((element) => {
            expect(element.play).toHaveBeenCalledTimes(1);
        });
    });

    test("playTick() uses the clock-one-tick audio file", () => {
        audioModule.toggleAudio();
        audioModule.playTick();

        expect(audioFactory).toHaveBeenCalledWith("./audio/clock-one-tick.mp3");
    });

    test("reuses the same audio element for repeated cues", () => {
        audioModule.toggleAudio();

        audioModule.playAudioCue("inhale");
        audioModule.playAudioCue("inhale");

        expect(audioFactory).toHaveBeenCalledTimes(1);
        expect(createdElements[0].play).toHaveBeenCalledTimes(2);
    });

    test("restarts the audio from the beginning on every play", () => {
        audioModule.toggleAudio();

        audioModule.playAudioCue("inhale");
        createdElements[0].currentTime = 5;
        audioModule.playAudioCue("inhale");

        expect(playedCurrentTimes).toEqual([0, 0]);
    });

    test("ignores cues it doesn't know about", () => {
        audioModule.toggleAudio();
        audioModule.playAudioCue("gong");

        expect(audioFactory).not.toHaveBeenCalled();
    });

    test("stopAllAudio() pauses and rewinds every created element", () => {
        audioModule.toggleAudio();
        audioModule.playAudioCue("inhale");
        audioModule.playAudioCue("hold");

        audioModule.stopAllAudio();

        expect(createdElements[0].pause).toHaveBeenCalledTimes(1);
        expect(createdElements[1].pause).toHaveBeenCalledTimes(1);
        expect(createdElements[0].currentTime).toBe(0);
        expect(createdElements[1].currentTime).toBe(0);
    });

    test("toggling audio off stops anything that is playing", () => {
        audioModule.toggleAudio();
        audioModule.playAudioCue("exhale");

        audioModule.toggleAudio();

        expect(audioModule.isAudioEnabled()).toBe(false);
        expect(createdElements[0].pause).toHaveBeenCalledTimes(1);
        expect(createdElements[0].currentTime).toBe(0);
    });

    test("survives play() rejections caused by browser autoplay policies", () => {
        audioModule.initializeAudio(() => ({
            currentTime: 0,
            play: jest.fn(() => Promise.reject(new Error("play() was blocked"))),
            pause: jest.fn()
        }));
        audioModule.toggleAudio();

        expect(() => audioModule.playAudioCue("inhale")).not.toThrow();
    });
});
