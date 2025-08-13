import { PlayerBase } from '../PlayerBase';
import { clamp, roundInt, computeAverage, computeTarget /*, pickRandom*/ } from '../../utils/math';
import type { IPlayer } from '../IPlayer';

export class DualModeAlice extends PlayerBase {
    private initial = true;
    chooseNumber(): number { return this.decide(false); }
    predictNumber(): number { return this.decide(true); }

    private decide(isPredict: boolean): number {
        if (this.initial) {
            this.initial = false;
            return 20; // opening per spec
        }

        const others = this.getOpponents();
        const predicted = others.map(p => p.predictNumber());
        const N = others.length + 1;
        const avgPred = computeAverage(predicted);
        const Tpred = computeTarget((avgPred * others.length + 40) / N); // rough; 40 as neutral self prior

        // Detect likely tie cluster near Tpred (values at same nearest distance)
        const nearestDist = Math.min(...predicted.map(v => Math.abs(v - Tpred)));
        const cluster = predicted.filter(v => Math.abs(Math.abs(v - Tpred) - nearestDist) <= 1e-9);

        if (cluster.length >= 2) {
            // Opportunity mode: place ourselves as the unique next-closest
            // Find a number slightly worse than the nearestDist but better than any outsider
            // Simple heuristic: step outward by +1/-1 away from cluster center until unique
            const center = clamp(roundInt(computeAverage(cluster)));
            const trySeq = [center + 1, center - 1, center + 2, center - 2].map((x) => clamp(x));
            for (const x of trySeq) {
                const avg = computeAverage([...predicted, x]);
                const T = computeTarget(avg);
                const my = Math.abs(x - T);
                const dists = predicted.map(v => Math.abs(v - T)).sort((a, b) => a - b);
                const minOther = dists[0];
                const countMin = dists.filter(d => Math.abs(d - minOther) <= 1e-9).length;
                if (countMin >= 2 && my > minOther + 1e-9) {
                    // First ring is a tie (discarded); ensure we beat the next ring uniquely
                    const outsider = dists[countMin] ?? Infinity;
                    if (my < outsider - 1e-9) return x;
                }
            }
        }

        // Safe default: rational-esque with tiny deconflict jitter in prediction vs action
        const base = this.lastAvg * 0.8;
        const x = clamp(roundInt(base));
        if (isPredict) return x;
        // deconflict
        return clamp(roundInt(x + (Math.random() < 0.5 ? -1 : 1)));
    }

    private getOpponents(): IPlayer[] {
        // Injected by Game at runtime; see HalfKnowledgeKing for note.
        // @ts-ignore
        return (this as any).__opponents ?? [];
    }
}