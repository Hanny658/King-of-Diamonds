import { PlayerBase } from '../PlayerBase';
import { GameRecord } from '../../core/GameRecord';
import { randInt } from '../../utils/math';

export class CopycatPlayer extends PlayerBase {
    chooseNumber(): number {
        const last = GameRecord.instance.lastRound;
        if (!last) return randInt(15, 50);
        const winner = last.winnerId;
        if (winner == null) return randInt(15, 50);
        const entry = last.choices.find(c => c.playerId === winner);
        return entry ? entry.value : randInt(15, 50);
    }
    predictNumber(): number {
        const last = GameRecord.instance.lastRound;
        if (!last) return 32;
        const winner = last.winnerId;
        const entry = last.choices.find(c => c.playerId === winner);
        return entry ? entry.value : 32;
    }
}