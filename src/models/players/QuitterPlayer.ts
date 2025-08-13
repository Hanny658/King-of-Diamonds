import { PlayerBase } from '../PlayerBase';
import { clamp, randInt, roundInt } from '../../utils/math';

export class QuitterPlayer extends PlayerBase {
    private initialPicked = false;
    chooseNumber(): number {
        const inCollapse = this.hp < 5;
        if (!this.initialPicked && !this.hasHistory()) { this.initialPicked = true; return randInt(15, 50); }
        if (!inCollapse) {
            const base = this.lastAvg * 0.8;
            return clamp(roundInt(base + randInt(-2, 2)));
        }
        // collapse: 80% random, 20% swing-like (±2)
        if (Math.random() < 0.8) return randInt(0, 100);
        const base = this.lastAvg * 0.8;
        return clamp(roundInt(base + randInt(-2, 2)));
    }
    predictNumber(): number {
        const base = (this.hasHistory() ? this.lastAvg : 40) * 0.8;
        if (this.hp < 5) return roundInt(0.5 * 50 + 0.5 * base); // rough mixture
        return clamp(roundInt(base));
    }
    private hasHistory(): boolean { return !!(this as any).lastAvg; }
}