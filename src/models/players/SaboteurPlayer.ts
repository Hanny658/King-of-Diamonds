import { PlayerBase } from '../PlayerBase';
import { randInt } from '../../utils/math';

export class SaboteurPlayer extends PlayerBase {
    private initialPicked = false;
    chooseNumber(): number {
        if (!this.initialPicked && !this.hasHistory()) { this.initialPicked = true; return randInt(1, 10); }
        // Focus on extremes to perturb average
        return Math.random() < 0.5 ? randInt(0, 7) : randInt(90, 100);
    }
    predictNumber(): number {
        // expectation: center of his ranges (rough)
        return 0.5 * ((0 + 7) / 2) + 0.5 * ((90 + 100) / 2);
    }
    private hasHistory(): boolean { return !!(this as any).lastAvg; }
}