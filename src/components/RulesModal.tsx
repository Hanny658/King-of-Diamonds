import { useMemo, useState } from 'preact/hooks';
import type { IPlayer } from '../models/IPlayer';
import type { Personality } from '../models/types';
import { createPortal } from 'preact/compat';

type Settings = {
    minPlayers: number;
    maxPlayers: number;
    initialHP: number;
    numberRange: [number, number]; // [0,100]
    singletonKinds: Personality[]; // e.g., ['Human','Kyzuryu']
};

type Props = {
    players: IPlayer[];
    allKinds: Personality[];        // ALL_KINDS
    settings: Settings;
    hideKinds?: boolean;
};

export function GameInfoModal({ players, allKinds, settings, hideKinds = true }: Props) {
    const [open, setOpen] = useState(false);
    const [hideRosteredKinds, setHideRosteredKinds] = useState(hideKinds);

    const rosterByKind = useMemo(() => {
        const m = new Map<string, number>();
        for (const p of players) m.set(p.kind, (m.get(p.kind) ?? 0) + 1);
        return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [players]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 !px-2 !py-1.5 border-0 !bg-transparent"
                title="Game rules & AI descriptions"
            >
                <i className="bi bi-patch-question text-3xl"></i>
            </button>

            {open && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center h-screen" aria-modal="true" role="dialog">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
                    {/* Panel */}
                    <div className="relative z-10 w-[min(980px,94vw)] max-h-[90vh] kd-animate-in overflow-y-auto">
                        <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                                <h3 className="text-base sm:text-lg font-semibold !text-amber-50">
                                    Game Rules & Settings
                                </h3>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-0.5 text-2xl rounded !bg-transparent text-gray-100 hover:text-gray-400"
                                    aria-label="Close"
                                >
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-4 sm:p-6 overflow-auto space-y-8 text-sm leading-relaxed">
                                {/* Settings */}
                                <section>
                                    <h4 className="text-slate-200 font-semibold mb-2">Current Settings</h4>
                                    <ul className="list-disc ml-6 space-y-1 text-slate-300">
                                        <li>Players: <span className="font-mono">{players.length}</span> (allowed <span className="font-mono">{settings.minPlayers}–{settings.maxPlayers}</span>)</li>
                                        <li>Initial HP: <span className="font-mono">{settings.initialHP}</span></li>
                                        <li>Number range each round: <span className="font-mono">{settings.numberRange[0]}–{settings.numberRange[1]}</span> (integers)</li>
                                        <li>Singleton AIs (max one per match): <span className="font-mono">{settings.singletonKinds.join(', ') || '—'}</span></li>
                                    </ul>

                                    {players.length > 0 && (
                                        <div className="mt-3">
                                            <div className="text-slate-400 mb-1">Roster by type:
                                                <button
                                                    onClick={() => setHideRosteredKinds(v => !v)}
                                                    className="ml-1 p-0.5 !bg-transparent border-0 text-slate-400 hover:text-slate-200"
                                                    title={hideRosteredKinds ? 'Show types' : 'Hide types'}
                                                >
                                                    {hideRosteredKinds
                                                        ? <i class="bi bi-eye-slash-fill"></i>
                                                        : <i class="bi bi-eye-fill"></i>}
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {hideRosteredKinds == false &&
                                                    rosterByKind.map(([k, n]) => (
                                                        <span key={k} className="px-2 rounded !text-gray-400 !bg-slate-800 border !border-slate-700">
                                                            {k}: <span className="font-mono">{n}</span>
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* Rules */}
                                <section>
                                    <h4 className="text-slate-200 font-semibold mb-2">Game Rules</h4>
                                    <ol className="list-decimal ml-6 space-y-2 text-slate-300">
                                        <li><b>Simultaneous choice:</b> each alive player chooses an integer in {settings.numberRange[0]}–{settings.numberRange[1]}.</li>
                                        <li><b>Average & target:</b> compute the average using <i>only alive players’</i> choices; the target is <span className="font-mono">T = 0.8 × average</span>.</li>
                                        <li><b>All-same penalty:</b> if all alive players chose the same number, all alive lose 1 HP.</li>
                                        <li><b>Tie-discard rule:</b> find the closest distance(s) to T; if there’s a tie at that distance, discard the whole group and search the next ring outward until a unique closest player is found.</li>
                                        <li>
                                            <b>Damage.</b> The unique winner (if any) takes no damage; all other <i>alive</i> players lose 1 HP.
                                            In a degenerate “all rings tie” situation, all alive players lose 1 HP.
                                            <br />
                                            <b>Perfect hit:</b> If the winner’s chosen number equals <code>round(T)</code>, all other alive players lose <b>2 HP</b> instead.
                                        </li>
                                        <li><b>Dead players:</b> players with HP = 0 are skipped (recorded as “—”) and do not affect average or T.</li>
                                        <li><b>Special 2-player rule:</b> when exactly two players are alive and the picks are <span className="font-mono">0</span> and <span className="font-mono">100</span>, the <b>100</b> picker wins that round.</li>
                                        <li><b>End of match:</b> when only one player remains alive, they are declared the winner.</li>
                                    </ol>
                                </section>

                                {/* AI Descriptions */}
                                <section>
                                    <h4 className="text-slate-200 font-semibold mb-2">AI Characteristics</h4>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <AIBox title="Human">
                                            <ul className="list-disc ml-5">
                                                <li>Manually picks a number via the selector panel each round.</li>
                                                <li>Limited to one instance per match (singleton).</li>
                                            </ul>
                                        </AIBox>

                                        <AIBox title="Rational">
                                            <ul className="list-disc ml-5">
                                                <li>Round 1: random 15–50.</li>
                                                <li>Later: picks <span className="font-mono">round(0.8 × lastAverage) ± 1</span> (small arithmetic error).</li>
                                            </ul>
                                        </AIBox>

                                        <AIBox title="SwingRational">
                                            <ul className="list-disc ml-5">
                                                <li>Round 1: random 15–50.</li>
                                                <li>Later: <span className="font-mono">round(0.8 × lastAverage)</span> with swing: ±2 (HP&gt;6), ±3 (HP≤6), ±4 (HP≤3).</li>
                                            </ul>
                                        </AIBox>

                                        <AIBox title="Saboteur">
                                            <ul className="list-disc ml-5">
                                                <li>Round 1: random 1–10.</li>
                                                <li>Later: random in 0–7 or 90–100 (perturbs the average).</li>
                                            </ul>
                                        </AIBox>

                                        <AIBox title="Quitter">
                                            <ul className="list-disc ml-5">
                                                <li>HP≥5: like SwingRational (±2 around 0.8×lastAverage).</li>
                                                <li>HP&lt;5: 80% fully random, 20% SwingRational(±2).</li>
                                            </ul>
                                        </AIBox>

                                        <AIBox title="Copycat">
                                            <ul className="list-disc ml-5">
                                                <li>Copies last round’s winner number (no offset).</li>
                                            </ul>
                                        </AIBox>

                                        <AIBox title="Smooth">
                                            <ul className="list-disc ml-5">
                                                <li>First 3 rounds: like Rational.</li>
                                                <li>After: exponential smoothing on averages, then picks 0.8 × smoothedAverage.</li>
                                            </ul>
                                        </AIBox>

                                        <AIBox title="Mathematician">
                                            <ul className="list-disc ml-5">
                                                <li>Each round randomly applies 0.8¹…0.8⁵ to lastAverage (i.e., 1–5 layers of reasoning) and rounds/clamps.</li>
                                            </ul>
                                        </AIBox>

                                        <AIBox title="Gambler">
                                            <ul className="list-disc ml-5">
                                                <li>HP≥5: fully random.</li>
                                                <li>HP&lt;5: behaves like Rational (0.8 × lastAverage).</li>
                                            </ul>
                                        </AIBox>

                                        <AIBox title="Kyzuryu">
                                            <ul className="list-disc ml-5">
                                                <li>Predicts others via their expected behavior; scans a small candidate set.</li>
                                                <li>Chooses a number that makes itself the unique closest when possible; otherwise picks max margin.</li>
                                                <li>Singleton (at most one per match).</li>
                                            </ul>
                                        </AIBox>
                                    </div>

                                    {/* Show allKinds for transparency */}
                                    <div className="mt-4 text-xs text-slate-400">
                                        Available kinds: <span className="font-mono">{allKinds.join(', ')}</span>
                                    </div>
                                </section>
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 flex justify-end">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="px-3 py-1.5 rounded !text-white !bg-slate-700 hover:!bg-slate-600"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.getElementById('root') ?? document.body
            )}
        </>
    );
}

function AIBox({ title, children }: { title: string; children: preact.ComponentChildren }) {
    return (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
            <div className="font-semibold mb-1 text-cyan-600">{title}</div>
            <div className="text-slate-300">{children}</div>
        </div>
    );
}
