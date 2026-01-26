import { PlayerBase } from '../PlayerBase';
import { clamp, roundInt, computeAverage, computeTarget, pickRandom } from '../../utils/math';
import type { IPlayer } from '../IPlayer';

/** AI Player: Kuzuryu
 * 
 * Strat. - Predict others (expectation-based)
 *        - Scan a small candidate set to maximize chance of unique-closest (bit of 'cheating' hahaha)
 *        - Cooresponding to Kuzuryu, always able to find how people is doing
 */
export class Kuzuryu extends PlayerBase {
    chooseNumber(): number {
        return this.pickBest(false);
    }
    predictNumber(): number { return this.pickBest(true); }

    private pickBest(isPredict: boolean): number {
        // Build predicted choices of opponents without recursive Kuzuryu calls.
        const others = this.getOpponents();
        const predicted = this.buildOpponentPredictions(others);
        const N = others.length + 1;
        // Candidate list: around the fixed point + boundaries
        const avgPred = computeAverage(predicted);
        const xStar = (0.8 * (avgPred * others.length)) / (N - 0.8); // approximate best-response fixed-point
        const candidates = Array.from(new Set([
            clamp(roundInt(xStar)), clamp(roundInt(xStar - 1)), clamp(roundInt(xStar + 1)),
            clamp(roundInt(xStar - 2)), clamp(roundInt(xStar + 2)), 0, 100
        ]));

        // Evaluate candidates: prefer strict unique-closest; fallback to min distance
        type Eval = { x: number; uniqueWin: boolean; margin: number };
        const evals: Eval[] = candidates.map(x => {
            const avg = computeAverage([...predicted, x]);
            const T = computeTarget(avg);
            const myDist = Math.abs(x - T);
            const othersDist = predicted.map(v => Math.abs(v - T));
            const minOther = Math.min(...othersDist);
            const uniqueWin = myDist < minOther - 1e-9; // strictly closer than everyone else
            return { x, uniqueWin, margin: minOther - myDist };
        });

        const winners = evals.filter(e => e.uniqueWin);
        if (winners.length) {
            return this.selectCandidate(winners, isPredict).x;
        }
        // Fallback: pick largest margin (deterministic for predict, random otherwise)
        const maxMargin = Math.max(...evals.map(e => e.margin));
        const bests = evals.filter(e => Math.abs(e.margin - maxMargin) <= 1e-9);
        return this.selectCandidate(bests, isPredict).x;
    }

    private getOpponents(): IPlayer[] {
        // In a simple FE simulation, we can let the Game inject a reference OR locate via a global registry.
        // For skeleton simplicity, we assume predictNumber() is called on up-to-date instances provided by Game.
        // This method will be replaced at runtime by Game through dependency injection.
        // @ts-ignore
        return (this as any).__opponents ?? [];
    }

    private selectCandidate(candidates: { x: number }[], isPredict: boolean): { x: number } {
        if (candidates.length <= 1) return candidates[0];
        if (isPredict) {
            const idx = Math.abs(this.id) % candidates.length;
            return candidates[idx];
        }
        return pickRandom(candidates);
    }

    private buildOpponentPredictions(others: IPlayer[]): number[] {
        const nonKuz = others.filter(p => p.kind !== 'Kuzuryu');
        const kuzOpp = others.filter(p => p.kind === 'Kuzuryu');
        const nonKuzPred = nonKuz.map(p => p.predictNumber());

        if (kuzOpp.length === 0) return nonKuzPred;

        const offsets = this.kuzuryuOffsets(kuzOpp.length);
        let kuzPred = offsets.map(off => clamp(roundInt(this.lastAvg * 0.8 + off)));

        // A couple of fixed-point iterations to align Kuzuryu guesses.
        for (let i = 0; i < 2; i++) {
            const avgPred = computeAverage([...nonKuzPred, ...kuzPred]);
            const N = others.length + 1;
            const xStar = (0.8 * (avgPred * others.length)) / (N - 0.8);
            kuzPred = offsets.map(off => clamp(roundInt(xStar + off)));
        }

        return [...nonKuzPred, ...kuzPred];
    }

    private kuzuryuOffsets(count: number): number[] {
        const offsets: number[] = [];
        for (let i = 0; i < count; i++) {
            if (i === 0) offsets.push(0);
            else {
                const step = Math.ceil(i / 2);
                offsets.push(i % 2 === 1 ? -step : step);
            }
        }
        return offsets;
    }
}
