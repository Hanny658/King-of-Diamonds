// src/audio/BGMContext.tsx
import { createContext } from "preact";
import { useEffect, useState } from "preact/hooks";
import { bgmManager } from "./BGMManager";

type BGMContextValue = {
    playing: boolean;
    volume: number;
    play: () => void;
    stop: () => void;
    toggle: () => void;
    setVolume: (v: number) => void;
};

export const BGMContext = createContext<BGMContextValue>({
    playing: false,
    volume: 0.6,
    play: () => { },
    stop: () => { },
    toggle: () => { },
    setVolume: () => { },
});

export function BGMProvider({ children }: { children: preact.ComponentChildren }) {
    const [playing, setPlaying] = useState(bgmManager.playing);
    const [volume, setVol] = useState(bgmManager.volume);

    // Keep UI in sync with manager events
    useEffect(() => {
        return bgmManager.subscribe(() => {
            setPlaying(bgmManager.playing);
            setVol(bgmManager.volume);
        });
    }, []);

    // Optional: respect page visibility (pause when hidden; resume if user wanted it)
    useEffect(() => {
        const onVis = () => {
            if (document.hidden && bgmManager.playing) {
                bgmManager.stop();
                // Mark an intent to resume when visible again
                sessionStorage.setItem("bgm.resume", "1");
            } else if (!document.hidden && sessionStorage.getItem("bgm.resume") === "1") {
                sessionStorage.removeItem("bgm.resume");
                // Only resume if user preference is ON
                if (bgmManager.shouldAutostart()) bgmManager.play();
            }
        };
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    // On first user interaction you can optionally auto-start if user had it ON
    // (Most browsers require a gesture; this hook doesn't force-play.)
    useEffect(() => {
        const firstClick = () => {
            if (bgmManager.shouldAutostart()) bgmManager.play();
            window.removeEventListener("pointerdown", firstClick);
            window.removeEventListener("keydown", firstClick);
        };
        window.addEventListener("pointerdown", firstClick, { once: true });
        window.addEventListener("keydown", firstClick, { once: true });
        return () => {
            window.removeEventListener("pointerdown", firstClick);
            window.removeEventListener("keydown", firstClick);
        };
    }, []);

    return (
        <BGMContext.Provider
            value={{
                playing,
                volume,
                play: () => bgmManager.play(),
                stop: () => bgmManager.stop(),
                toggle: () => bgmManager.toggle(),
                setVolume: (v) => bgmManager.setVolume(v),
            }}
        >
            {children}
        </BGMContext.Provider>
    );
}
