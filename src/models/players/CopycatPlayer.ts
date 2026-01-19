import { PlayerBase } from '../PlayerBase';
import { GameRecord } from '../../core/GameRecord';
import { randInt } from '../../utils/math';

/** AI Player: Copycat
 * 
 * Strat. - Always copy the last winner's choice
 *        - For the first round, it will pick random that seem to be powerful
 */
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