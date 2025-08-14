import type { IPlayer } from '../models/IPlayer';
import { GameRecord } from './GameRecord';
import type { Choice, RoundData } from '../models/types';
import { computeAverage, computeTarget } from '../utils/math';

export type WinnerInfo = { id: number; name: string; kind: string; hp: number };

export class Game {
    public players: IPlayer[];
    public matchWinner: WinnerInfo | null = null;

    constructor(players: IPlayer[]) {
        this.players = players;
    }

    /** opponents visible to predictors should exclude dead players */
    injectOpponentsForPredictors() {
        for (const p of this.players) {
            // @ts-ignore
            p.__opponents = this.players.filter(q => q.id !== p.id && q.hp > 0);
        }
    }

    private alivePlayers(): IPlayer[] {
        return this.players.filter(p => p.hp > 0);
    }

    playRound(): RoundData {
        if (this.matchWinner) {
            throw new Error('Match already finished.');
        }

        this.injectOpponentsForPredictors();

        const alive = this.alivePlayers();
        // 1) collect choices: dead players contribute -1 (not counted in avg/T)
        const choices: Choice[] = this.players.map(p => {
            if (p.hp <= 0) return { playerId: p.id, value: -1 };
            return { playerId: p.id, value: p.chooseNumber() };
        });

        const aliveValues = choices.filter(c => c.value >= 0).map(c => c.value);
        const allSameAlive = aliveValues.length > 0 && aliveValues.every(v => v === aliveValues[0]);

        // 2) compute avg/T using only alive choices
        const avg = computeAverage(aliveValues);
        const target = computeTarget(avg);

        // 3) resolve winner per rules
        let winnerId: number | null = null;

        if (alive.length <= 1) {
            // Corner: nothing to play
            winnerId = alive[0]?.id ?? null;
        } else if (alive.length === 2) {
            // Special rule: if picks are 0 and 100 (order irrelevant), 100 wins
            const pair = choices.filter(c => c.value >= 0);
            const vals = pair.map(p => p.value).sort((a, b) => a - b);
            if (vals[0] === 0 && vals[1] === 100) {
                const hundred = pair.find(p => p.value === 100)!;
                winnerId = hundred.playerId;
            }
        }

        if (winnerId === null) {
            if (allSameAlive) {
                // All alive picked same → all alive lose 1 HP
                for (const pl of alive) pl.loseHP(1);
            } else {
                // Unique-closest with tie-discard rings (consider only alive for distances)
                const aliveDistances = choices
                    .filter(c => c.value >= 0)
                    .map(c => ({ id: c.playerId, d: Math.abs(c.value - target) }))
                    .sort((a, b) => a.d - b.d);

                // group by distance (eps)
                const eps = 1e-9;
                const groups: { d: number; ids: number[] }[] = [];
                for (const item of aliveDistances) {
                    const g = groups.find(G => Math.abs(G.d - item.d) <= eps);
                    if (g) g.ids.push(item.id);
                    else groups.push({ d: item.d, ids: [item.id] });
                }
                const uniqueGroup = groups.find(g => g.ids.length === 1);
                if (uniqueGroup) {
                    winnerId = uniqueGroup.ids[0];
                } else {
                    // degenerate: every ring ties → treat as all alive lose 1
                    for (const pl of alive) pl.loseHP(1);
                }
            }
        }

        // 4) apply damage if we have a winner this round
        if (winnerId !== null) {
            const tInt = Math.round(target);
            const winnerChoice = choices.find(c => c.playerId === winnerId && c.value >= 0)?.value;
            const perfectHit = winnerChoice !== undefined && winnerChoice === tInt;
            const dmg = perfectHit ? 2 : 1;

            for (const pl of alive) if (pl.id !== winnerId) pl.loseHP(dmg);
        }

        const round: RoundData = {
            roundNumber: GameRecord.instance.rounds.length + 1,
            choices,
            average: avg,
            target,
            winnerId,
        };
        GameRecord.instance.addRound(round);

        // 5) check match end: if only one alive remains → record matchWinner
        const aliveAfter = this.alivePlayers();
        if (aliveAfter.length === 1) {
            const w = aliveAfter[0];
            this.matchWinner = { id: w.id, name: w.name, kind: w.kind, hp: w.hp };
        } else if (aliveAfter.length === 0) {
            // rare: everyone died simultaneously; choose no winner (or pick last-round winner if you prefer)
            this.matchWinner = null;
        }

        // 6) post hooks
        for (const p of this.players) p.onRoundEnd?.(round);

        return round;
    }
}
