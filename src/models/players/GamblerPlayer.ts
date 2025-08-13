import { PlayerBase } from '../PlayerBase';
import { clamp, randInt, roundInt } from '../../utils/math';

export class GamblerPlayer extends PlayerBase {
    chooseNumber(): number {
        if (this.hp >= 5) return randInt(0, 100);
        return clamp(roundInt(this.lastAvg * 0.8));
    }
    predictNumber(): number {
        return this.hp >= 5 ? 50 : clamp(roundInt(this.lastAvg * 0.8));
    }
}