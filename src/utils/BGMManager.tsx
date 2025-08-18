// src/utils/bgmManager.ts
// A tiny singleton around HTMLAudioElement for global reuse.

const BGM_SRC = "/bgm-KoD.mp3";

type Listener = () => void;

class BGMManager {
    private audio: HTMLAudioElement;
    private listeners = new Set<Listener>();
    private storageKey = "bgm.playing";
    private volKey = "bgm.volume";

    constructor() {
        this.audio = new Audio(BGM_SRC);
        this.audio.loop = true;
        this.audio.preload = "auto";

        // Restore volume (default 0.6)
        const savedVol = Number(localStorage.getItem(this.volKey));
        this.audio.volume = Number.isFinite(savedVol) ? Math.min(Math.max(savedVol, 0), 1) : 0.6;

        // Wire events -> notify subscribers
        ["play", "pause", "ended", "volumechange"].forEach(ev =>
            this.audio.addEventListener(ev, () => this.emit()),
        );
    }

    /** Read-only states */
    get playing() {
        return !this.audio.paused;
    }
    get volume() {
        return this.audio.volume;
    }

    /** Public actions */
    async play() {
        // Required user gesture will be provided by the click that calls this.
        try {
            await this.audio.play();
            localStorage.setItem(this.storageKey, "1");
        } catch (err) {
            // Some browsers still may block; keep silent but notify
            console.warn("BGM play blocked or failed:", err);
        } finally {
            this.emit();
        }
    }

    stop() {
        // Pause (keeps currentTime so resuming feels seamless)
        this.audio.pause();
        localStorage.setItem(this.storageKey, "0");
        this.emit();
    }

    toggle() {
        this.playing ? this.stop() : this.play();
    }

    setVolume(v: number) {
        const clamped = Math.min(Math.max(v, 0), 1);
        this.audio.volume = clamped;
        localStorage.setItem(this.volKey, String(clamped));
        this.emit();
    }

    /** Startup preference */
    shouldAutostart() {
        return localStorage.getItem(this.storageKey) === "1";
    }

    /** Subscriptions for reactive UI */
    subscribe(fn: Listener) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }
    private emit() {
        this.listeners.forEach(fn => fn());
    }
}

export const bgmManager = new BGMManager();
