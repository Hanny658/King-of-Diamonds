import { PlayerBase } from '../PlayerBase';
import { GameRecord } from '../../core/GameRecord';
import { clamp, roundInt } from '../../utils/math';

export class SmoothPlayer extends PlayerBase {
    private alpha = 0.6; // smoothing factor
    private smoothedAvg: number | null = null;

    chooseNumber(): number {
        const gr = GameRecord.instance;
        const r = gr.rounds.length;
        if (r < 3) {
            // behave like Rational for first 3 rounds
            const base = gr.lastAverage * 0.8;
            return clamp(roundInt(base));
        }
        this.updateSmooth();
        return clamp(roundInt(0.8 * (this.smoothedAvg ?? gr.lastAverage)));
    }
    predictNumber(): number {
        const gr = GameRecord.instance;
        const r = gr.rounds.length;
        if (r < 3) return clamp(roundInt(gr.lastAverage * 0.8));
        this.updateSmooth();
        return clamp(roundInt(0.8 * (this.smoothedAvg ?? gr.lastAverage)));
    }
    private updateSmooth() {
        const gr = GameRecord.instance;
        if (!gr.rounds.length) { this.smoothedAvg = 40; return; }
        const last = gr.lastAverage;
        this.smoothedAvg = this.smoothedAvg == null ? last : this.alpha * last + (1 - this.alpha) * this.smoothedAvg;
    }
}
