import { useMemo } from 'preact/hooks';
import type { RoundData } from '../models/types';

type Props = { rounds: RoundData[] };

export function RoundsTable({ rounds }: Props) {
    const roundsDesc = useMemo(() => [...rounds].reverse(), [rounds.length]);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-slate-800">
                        <th className="text-left px-3 py-2">#</th>
                        <th className="text-left px-3 py-2">Average</th>
                        <th className="text-left px-3 py-2">Target (0.8×avg)</th>
                        <th className="text-left px-3 py-2">Winner</th>
                        <th className="text-left px-3 py-2">Choices</th>
                    </tr>
                </thead>
                <tbody>
                    {roundsDesc.map(r => (
                        <tr key={r.roundNumber} className="odd:bg-slate-800/50 align-top">
                            <td className="px-3 py-2">{r.roundNumber}</td>
                            <td className="px-3 py-2">{r.average.toFixed(2)}</td>
                            <td className="px-3 py-2">{r.target.toFixed(2)}</td>
                            <td className="px-3 py-2">{r.winnerId ?? '—'}</td>
                            <td className="px-3 py-2 font-mono">
                                <div className="flex flex-wrap gap-2">
                                    {r.choices.map(c => (
                                        <span key={`${r.roundNumber}-${c.playerId}`}
                                            className={`inline-flex items-center px-2 py-0.5 rounded
                                ${c.playerId == r.winnerId ?
                                                    (c.value == Math.round(r.target) ? "rainbow-bg" : "!bg-amber-500/40")
                                                    : "bg-slate-700"}`}>
                                            P{c.playerId}:{c.value < 0 ? '—' : c.value} &nbsp;
                                        </span>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
