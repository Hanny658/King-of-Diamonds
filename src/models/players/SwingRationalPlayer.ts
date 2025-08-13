import { PlayerBase } from '../PlayerBase';
import { clamp, roundInt, randInt } from '../../utils/math';

export class SwingRationalPlayer extends PlayerBase {
    private initialPicked = false;

    chooseNumber(): number {
        if (!this.initialPicked && !this.hasHistory()) { this.initialPicked = true; return randInt(15, 50); }
        const base = this.lastAvg * 0.8;
        const swing = this.sigmaByHP();
        return clamp(roundInt(base + randInt(-swing, swing)));
    }

    predictNumber(): number {
        // expectation = base, no noise
        return clamp(roundInt((this.hasHistory() ? this.lastAvg : 40) * 0.8));
    }

    private sigmaByHP(): number {
        if (this.hp <= 3) return 4;
        if (this.hp <= 6) return 3;
        return 2;
    }
    private hasHistory(): boolean { return !!(this as any).lastAvg; }
}