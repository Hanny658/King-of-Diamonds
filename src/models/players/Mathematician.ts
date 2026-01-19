import { PlayerBase } from '../PlayerBase';
import { clamp, roundInt } from '../../utils/math';

/** AI Player: Mathematician
 * 
 * Strat. - Thinks Multiple-depths (compare to classical rational)
 *        - Have it's own EQUATION towards winning
 */
export class Mathematician extends PlayerBase {
    // Or a multi-step calculat-er, cooresponding to the "Equation" in the show
    chooseNumber(): number {
        const steps = Math.floor(Math.random() * 5) + 1; // 1 to 5 depths
        const factor = Math.pow(0.8, steps);
        return clamp(roundInt(this.lastAvg * factor));
    }

    predictNumber(): number {
        const steps = Math.floor(Math.random() * 5) + 1; // 1 to 5 depths
        const factor = Math.pow(0.8, steps);
        return clamp(roundInt(this.lastAvg * factor));
    }
}
