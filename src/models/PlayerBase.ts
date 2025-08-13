import type { IPlayer } from './IPlayer';
import type { RoundData, Personality } from './types';
import { GameRecord } from '../core/GameRecord';

export abstract class PlayerBase implements IPlayer {
    id!: number;
    name!: string;
    kind!: Personality;
    hp!: number;
    
    constructor(id: number, name: string, kind: Personality, hp: number = 10) {
        this.id = id;
        this.name = name;
        this.kind = kind;
        this.hp = hp;
    }

    abstract chooseNumber(): number;
    abstract predictNumber(): number;

    get lastAvg() { return GameRecord.instance.lastAverage; }

    loseHP(amount: number = 1) { this.hp = Math.max(0, this.hp - amount); }
    onRoundEnd(_round: RoundData) { }
}
