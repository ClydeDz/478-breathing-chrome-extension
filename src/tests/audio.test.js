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
        audioModule.playAudioCue("inhale-beep");

        expect(audioFactory).not.toHaveBeenCalled();
        expect(createdElements).toHaveLength(0);
    });

    test("preloads every audio element as soon as audio is turned on", () => {
        audioModule.toggleAudio();

        expect(audioFactory).toHaveBeenCalledTimes(Object.keys(audioModule.AUDIO_SOURCES).length);
        Object.keys(audioModule.AUDIO_SOURCES).forEach((cue) => {
            expect(audioFactory).toHaveBeenCalledWith(audioModule.AUDIO_SOURCES[cue]);
        });
        createdElements.forEach((element) => {
            expect(element.play).not.toHaveBeenCalled();
        });
    });

    test("creates an audio element per cue and plays it when enabled", () => {
        audioModule.toggleAudio();

        Object.keys(audioModule.AUDIO_SOURCES).forEach((cue) => {
            audioModule.playAudioCue(cue);
        });

        expect(audioFactory).toHaveBeenCalledTimes(Object.keys(audioModule.AUDIO_SOURCES).length);
        expect(createdElements).toHaveLength(Object.keys(audioModule.AUDIO_SOURCES).length);
        Object.keys(audioModule.AUDIO_SOURCES).forEach((cue) => {
            expect(audioFactory).toHaveBeenCalledWith(audioModule.AUDIO_SOURCES[cue]);
        });
        createdElements.forEach((element) => {
            expect(element.play).toHaveBeenCalledTimes(1);
        });
    });

    test("src/audio stays in sync: every referenced file exists and no file is orphaned", () => {
        const fs = require("fs");
        const path = require("path");
        const audioDir = path.join(__dirname, "..", "audio");

        const referenced = Object.values(audioModule.AUDIO_SOURCES)
            .map((source) => path.basename(source))
            .sort();
        const onDisk = fs.readdirSync(audioDir)
            .filter((file) => file.endsWith(".mp3"))
            .sort();

        expect(onDisk).toEqual(referenced);
    });

    test("reuses the same audio element for repeated cues", () => {
        audioModule.toggleAudio();
        const preloadedCount = createdElements.length;

        audioModule.playAudioCue("inhale");
        audioModule.playAudioCue("inhale");

        expect(createdElements).toHaveLength(preloadedCount);
        expect(audioFactory).toHaveBeenCalledTimes(preloadedCount);
        const inhaleElement = createdElements.find((element) => element.source === "./audio/inhale.mp3");
        expect(inhaleElement.play).toHaveBeenCalledTimes(2);
    });

    test("restarts the audio from the beginning on every play", () => {
        audioModule.toggleAudio();
        const inhaleElement = createdElements.find((element) => element.source === "./audio/inhale.mp3");

        audioModule.playAudioCue("inhale");
        inhaleElement.currentTime = 5;
        audioModule.playAudioCue("inhale");

        expect(playedCurrentTimes).toEqual([0, 0]);
    });

    test("ignores cues it doesn't know about", () => {
        audioModule.toggleAudio();
        const preloadedCount = createdElements.length;
        audioModule.playAudioCue("gong");

        expect(createdElements).toHaveLength(preloadedCount);
        createdElements.forEach((element) => {
            expect(element.play).not.toHaveBeenCalled();
        });
    });

    test("stopAllAudio() pauses and rewinds every created element", () => {
        audioModule.toggleAudio();
        audioModule.playAudioCue("inhale");
        audioModule.playAudioCue("hold");

        audioModule.stopAllAudio();

        expect(createdElements.length).toBeGreaterThan(0);
        createdElements.forEach((element) => {
            expect(element.pause).toHaveBeenCalledTimes(1);
            expect(element.currentTime).toBe(0);
        });
    });

    test("toggling audio off stops anything that is playing", () => {
        audioModule.toggleAudio();
        audioModule.playAudioCue("exhale");

        audioModule.toggleAudio();

        expect(audioModule.isAudioEnabled()).toBe(false);
        const exhaleElement = createdElements.find((element) => element.source === "./audio/exhale.mp3");
        expect(exhaleElement.pause).toHaveBeenCalledTimes(1);
        expect(exhaleElement.currentTime).toBe(0);
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
