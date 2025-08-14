import { PlayerBase } from '../PlayerBase';
import { clamp, roundInt } from '../../utils/math';

export class HumanPlayer extends PlayerBase {
    private pendingChoice: number | null = null;

    // called by UI each round, before the game plays this round
    setPendingChoice(n: number) {
        // constrain to [0, 100] as your game uses integers
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
        this.pendingChoice = null; // consume once
        return v;
    }

    // Optional: used by predictors or UI tooling; just echo the pending or lastAvg*0.8
    predictNumber(): number {
        if (this.pendingChoice !== null) return this.pendingChoice;
        return clamp(roundInt(this.lastAvg * 0.8), 0, 100);
    }
}
