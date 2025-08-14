import type { IPlayer } from '../models/IPlayer';
import { GameRecord } from './GameRecord';
import type { Choice, RoundData } from '../models/types';
import { computeAverage, computeTarget } from '../utils/math';
import { HumanPlayer } from '../models/players/HumanPlayer';

export class Game {
    players!: IPlayer[];
    constructor(players: IPlayer[]) {
        this.players = players;
    }

    injectOpponentsForPredictors() {
        // Provide opponents to Kuzuryu
        for (const p of this.players) {
            // @ts-ignore
            p.__opponents = this.players.filter(q => q.id !== p.id);
        }
    }

    allHumansReady(): boolean {
    return this.players
        .filter(p => p.kind === 'Human')
        .every(p => (p as HumanPlayer).hasPendingChoice());
    }

    playRound(): RoundData {
        this.injectOpponentsForPredictors();

        const choices: Choice[] = this.players.map(p => ({ playerId: p.id, value: p.chooseNumber() }));

        // All same → all lose 1 HP
        const allSame = choices.every(c => c.value === choices[0].value);
        const avg = computeAverage(choices.map(c => c.value));
        const target = computeTarget(avg);

        let winnerId: number | null = null;

        if (allSame) {
            for (const pl of this.players) pl.loseHP(1);
        } else {
            // Find unique closest per rules: if tie for closest, discard the whole group and search outward
            // We do this by grouping by absolute distance and picking the smallest distance bucket with size 1.
            const distances = choices.map(c => ({ id: c.playerId, d: Math.abs(c.value - target) }));
            // Sort by distance asc
            distances.sort((a, b) => a.d - b.d);
            // Find first distance that occurs exactly once (within eps tolerance)
            const eps = 1e-9;
            const groups: { d: number; ids: number[] }[] = [];
            for (const item of distances) {
                const g = groups.find(G => Math.abs(G.d - item.d) <= eps);
                if (g) g.ids.push(item.id); else groups.push({ d: item.d, ids: [item.id] });
            }
            const uniqueGroup = groups.find(g => g.ids.length === 1);
            if (uniqueGroup) {
                winnerId = uniqueGroup.ids[0];
                for (const pl of this.players) if (pl.id !== winnerId) pl.loseHP(1);
            } else {
                // Degenerate (should be rare): if every ring ties, treat as all lose 1 to keep game moving.
                for (const pl of this.players) pl.loseHP(1);
            }
        }

        const round: RoundData = {
            roundNumber: GameRecord.instance.rounds.length + 1,
            choices,
            average: avg,
            target,
            winnerId,
        };
        GameRecord.instance.addRound(round);

        // Notify players (optional)
        for (const p of this.players) p.onRoundEnd?.(round);

        return round;
    }
}