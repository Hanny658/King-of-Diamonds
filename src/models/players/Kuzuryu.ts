import { PlayerBase } from '../PlayerBase';
import { clamp, roundInt, computeAverage, computeTarget, pickRandom } from '../../utils/math';
import type { IPlayer } from '../IPlayer';

export class Kuzuryu extends PlayerBase {
    // Predict others (expectation-based), then scan a small candidate set to maximize chance of unique-closest.
    // Cooresponding to Kuzuryu, always able to find how people is doing
    chooseNumber(): number {
        return this.pickBest(false);
    }
    predictNumber(): number { return this.pickBest(true); }

    private pickBest(isPredict: boolean): number {
        // Build predicted choices of opponents using their predictNumber().
        const others = this.getOpponents();
        const predicted = others.map(p => p.predictNumber());
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
            return isPredict ? winners[0].x : pickRandom(winners).x;
        }
        // Fallback: pick largest margin
        const best = evals.reduce((a, b) => (a.margin > b.margin ? a : b));
        return best.x;
    }

    private getOpponents(): IPlayer[] {
        // In a simple FE simulation, we can let the Game inject a reference OR locate via a global registry.
        // For skeleton simplicity, we assume predictNumber() is called on up-to-date instances provided by Game.
        // This method will be replaced at runtime by Game through dependency injection.
        // @ts-ignore
        return (this as any).__opponents ?? [];
    }
}