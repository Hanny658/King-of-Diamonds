import type { RoundData } from '../models/types';

export class GameRecord {
    private static _instance: GameRecord | null = null;
    public rounds: RoundData[] = [];

    private constructor() { }
    public static get instance(): GameRecord {
        // Singletonnnnnnnnnnnnnn
        if (!this._instance) this._instance = new GameRecord();
        return this._instance;
    }

    reset() { this.rounds = []; }

    addRound(r: RoundData) { this.rounds.push(r); }

    get lastRound(): RoundData | null { return this.rounds.length ? this.rounds[this.rounds.length - 1] : null; }

    get lastAverage(): number { return this.lastRound ? this.lastRound.average : 50; }
    get lastTarget(): number { return this.lastRound ? this.lastRound.target : 40; }
}