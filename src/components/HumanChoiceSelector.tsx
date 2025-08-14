import { useMemo, useState } from 'preact/hooks';
import type { IPlayer } from '../models/IPlayer';
import { HumanPlayer } from '../models/players/HumanPlayer';
import { clamp, roundInt } from '../utils/math';

type Props = {
    players: IPlayer[];
    onPick: (value: number) => void;
};

export function HumanChoiceSelector({ players, onPick }: Props) {
    const human = useMemo(() => players.find(p => p.kind === 'Human') as HumanPlayer | undefined, [players]);
    const [open, setOpen] = useState(false);

    if (!human) return null;

    const choose = (n: number) => {
        const v = clamp(roundInt(n), 0, 100);
        onPick(v);
        setOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500"
                title="Pick your number"
            >
                <i class="bi bi-ui-checks-grid"></i>
                <span>Select</span>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    aria-modal="true"
                    role="dialog"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setOpen(false)}
                    />
                    {/* Panel */}
                    <div className="relative z-10 w-[min(960px,92vw)] max-h-[88vh] kd-animate-in">
                        <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                                <h3 className="text-base sm:text-lg font-semibold">
                                    Your Choice is.. <span className="opacity-70">| 貴方の選択は..</span>
                                </h3>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="px-2 py-1 rounded hover:bg-slate-700"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-4 sm:p-5 overflow-auto">
                                {/* Row 0: single tile aligned right */}
                                <div className="mb-3 flex justify-end">
                                    <NumberTile n={0} onClick={choose} />
                                </div>

                                {/* Rows 1–100 in tens */}
                                <div className="space-y-3">
                                    {Array.from({ length: 10 }).map((_, r) => {
                                        const start = r * 10 + 1; // 1,11,21,...
                                        //const end = start + 9;     // 10,20,30,...
                                        const row = Array.from({ length: 10 }, (_, i) => start + i);
                                        return (
                                            <div key={r} className="flex flex-wrap gap-2">
                                                {row.map(n => (
                                                    <NumberTile key={n} n={n} onClick={choose} />
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer (optional helper text) */}
                            <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-300">
                                Click a square to submit your choice for this round. You can close this panel afterwards.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function NumberTile({ n, onClick }: { n: number; onClick: (n: number) => void }) {
    return (
        <button
            onClick={() => onClick(n)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-slate-800 hover:bg-emerald-600 active:scale-[0.98] transition
                    border border-slate-700 hover:border-emerald-400 text-slate-100 font-mono text-sm sm:text-base"
            title={`${n}`}
        >
            {n}
        </button>
    );
}
