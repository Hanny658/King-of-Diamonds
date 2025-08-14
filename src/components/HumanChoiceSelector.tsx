import { useEffect, useMemo, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import type { IPlayer } from '../models/IPlayer';
import { HumanPlayer } from '../models/players/HumanPlayer';
import { clamp, roundInt } from '../utils/math';

type Props = {
    players: IPlayer[];
    onPick: (value: number) => void;
};

export function HumanChoiceSelector({ players, onPick }: Props) {
    const human = useMemo(
        () => players.find(p => p.kind === 'Human') as HumanPlayer | undefined,
        [players]
    );
    const [open, setOpen] = useState(false);
    if (!human) return null;

    // lock body scroll while modal is open
    useEffect(() => {
        if (open) {
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = prevOverflow; };
        }
    }, [open]);

    const choose = (n: number) => {
        onPick(clamp(roundInt(n), 0, 100));
        setOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded !bg-indigo-600 hover:!bg-indigo-500"
                title="Pick your number"
            >
                <i class="bi bi-ui-checks-grid"></i>
                <span>Select</span>
            </button>

            {open && createPortal(
                <div className="fixed inset-0 z-[64] flex items-center justify-center" role="dialog" aria-modal="true">
                    {/* Backdrop covers the viewport */}
                    <div className="absolute inset-0 bg-black/50 overflow-y-auto" onClick={() => setOpen(false)} />

                    {/* Floating panel */}
                    <div className="relative z-10 w-[min(960px,92vw)] max-h-[88vh] kd-animate-in">
                        <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                                <h3 className="text-base sm:text-lg font-semibold !text-gray-100">
                                    Your Choice is.. <span className="opacity-70">| 貴方の選択は..</span>
                                </h3>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-0 text-2xl text-white !bg-transparent"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-4 sm:p-5 overflow-auto">
                                {/* Row 0 right-aligned */}
                                <div className="mb-3 flex justify-end">
                                    <NumberTile n={0} onClick={choose} />
                                </div>
                                {/* 1–100 in tens */}
                                <div className="space-y-0">
                                    {Array.from({ length: 10 }).map((_, r) => {
                                        const start = r * 10 + 1;
                                        return (
                                            <div key={r} className="flex flex-wrap gap-0">
                                                {Array.from({ length: 10 }, (_, i) => start + i).map(n => (
                                                    <NumberTile key={n} n={n} onClick={choose} />
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-300">
                                Click a square to submit your choice for this round.
                            </div>
                        </div>
                    </div>
                </div>,
                // mount into modal-root if present, else body
                document.getElementById('modal-root') ?? document.body
            )}
        </>
    );
}

function NumberTile({ n, onClick }: { n: number; onClick: (n: number) => void }) {
    return (
        <button
            onClick={() => onClick(n)}
            className="w-[10%] h-10 !bg-slate-800 hover:!bg-emerald-600 active:scale-[0.98] transition
                        border !border-slate-700 hover:!border-emerald-400 !text-slate-100 font-mono text-sm sm:text-base"
            title={`${n}`}
        >
            {n}
        </button>
    );
}
