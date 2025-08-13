import { PlayerBase } from '../PlayerBase';
import { clamp, roundInt } from '../../utils/math';

export class MultiStepPlayer extends PlayerBase {
    chooseNumber(): number {
        return clamp(roundInt(this.lastAvg * 0.64)); // 0.8 × 0.8 = 0.64
    }
    predictNumber(): number { return clamp(roundInt(this.lastAvg * 0.64)); }
}