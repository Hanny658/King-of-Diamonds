// src/components/BGMPlayer.tsx
import { useContext, useMemo } from "preact/hooks";
import { BGMContext } from "../utils/BGMContext";

export function BGMPlayer() {
    const { playing, toggle, volume, setVolume } = useContext(BGMContext);

    // Derived label for screen readers
    const ariaVolumeText = useMemo(() => {
        if (volume <= 0) return "Muted";
        if (volume < 0.34) return "Low volume";
        if (volume < 0.67) return "Medium volume";
        return "High volume";
    }, [volume]);

    return (
        <div className="inline-flex items-center gap-1 align-middle justify-center">
            {/* Toggle play/stop */}
            <button
                onClick={toggle}
                className="inline-flex items-center gap-2 !px-2 !py-1.5 border-0 !bg-transparent"
                title={playing ? "Mute background music" : "Play background music"}
                aria-pressed={playing}
                aria-label={playing ? "Mute background music" : "Play background music"}
            >
                <i className={`bi ${playing ? "bi-volume-up-fill" : "bi-volume-mute-fill"} text-3xl`} />
            </button>

            {/* Volume slider */}
            <div className="inline-flex items-center gap-1">
                <input
                    id="bgm-volume"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onInput={(e) => setVolume(Number((e.target as HTMLInputElement).value))}
                    aria-label="Background music volume"
                    aria-valuemin={0}
                    aria-valuemax={1}
                    aria-valuenow={Number(volume.toFixed(2))}
                    aria-valuetext={ariaVolumeText}
                    className="w-28 accent-current cursor-pointer"
                    title={`Volume: ${Math.round(volume * 100)}%`}
                />
            </div>
        </div>
    );
}
