import type { RoundData, Personality } from './types';

export interface IPlayer {
    id: number;
    name: string;
    kind: Personality;
    hp: number;
    chooseNumber(): number;             // commit selection for this round
    predictNumber(): number;            // expectation-based prediction (no randomness)
    onRoundEnd?(round: RoundData): void;// optional hook: observe results, update internal state
    loseHP(amount?: number): void;
}