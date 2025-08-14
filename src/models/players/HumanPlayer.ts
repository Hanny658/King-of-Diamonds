import { PlayerBase } from '../PlayerBase';
import { clamp, roundInt } from '../../utils/math';

export class HumanPlayer extends PlayerBase {
    private pendingChoice: number | null = null;

    setPendingChoice(n: number) {
        this.pendingChoice = clamp(roundInt(n), 0, 100);
    }
    hasPendingChoice(): boolean {
        return this.pendingChoice !== null;
    }

    chooseNumber(): number {
        if (this.pendingChoice === null) {
            throw new Error(`Human player ${this.name} has no submitted choice this round.`);
        }
        const v = this.pendingChoice;
        this.pendingChoice = null; // consume per round
        return v;
    }

    predictNumber(): number {
        if (this.pendingChoice !== null) return this.pendingChoice;
        return clamp(roundInt(this.lastAvg * 0.8));
    }
}
