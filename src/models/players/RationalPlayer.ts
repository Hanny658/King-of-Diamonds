import { PlayerBase } from '../PlayerBase';
import { clamp, roundInt, randInt } from '../../utils/math';

export class RationalPlayer extends PlayerBase {
    // initial pick: random 15–50
    private initialPicked = false;

    chooseNumber(): number {
        if (!this.initialPicked && !this.hasHistory()) {
            this.initialPicked = true;
            return randInt(15, 50);
        }
        const x = this.lastAvg * 0.8 + this.bias();
        return clamp(roundInt(x));
    }

    predictNumber(): number {
        // expected value without random bias
        const base = this.hasHistory() ? this.lastAvg * 0.8 : 32; // ~mid of 15–50×0.8
        return clamp(roundInt(base));
    }

    private bias(): number { return randInt(-1, 1); } // ±1 arithmetic error
    private hasHistory(): boolean { return !!(this as any).lastAvg; }
}
