import type { IPlayer } from './IPlayer';
import type { Personality } from './types';
import { RationalPlayer } from './players/RationalPlayer';
import { SwingRationalPlayer } from './players/SwingRationalPlayer';
import { SaboteurPlayer } from './players/SaboteurPlayer';
import { QuitterPlayer } from './players/QuitterPlayer';
import { CopycatPlayer } from './players/CopycatPlayer';
import { SmoothPlayer } from './players/SmoothPlayer';
import { Mathematician } from './players/Mathematician';
import { GamblerPlayer } from './players/GamblerPlayer';
import { Kuzuryu } from './players/Kuzuryu';
import { HumanPlayer } from './players/HumanPlayer';

// Stores all Player Kinds
export const ALL_KINDS: Personality[] = [
    'Rational', 'SwingRational', 'Saboteur', 'Quitter', 'Copycat',
    'Smooth', 'Gambler', 'Mathematician', 'Kuzuryu', 'Human'
];

// That can only have one-at-a-time (Probably remove Human when it becomes online multi-player)
export const SINGLETON_KINDS: Personality[] = [
    'Human'
];

// Manufacture method
export function createPlayer(kind: Personality, id: number, name: string): IPlayer {
    switch (kind) {
        case 'Human': return new HumanPlayer(id, name, kind);
        case 'Rational': return new RationalPlayer(id, name, kind);
        case 'SwingRational': return new SwingRationalPlayer(id, name, kind);
        case 'Saboteur': return new SaboteurPlayer(id, name, kind);
        case 'Quitter': return new QuitterPlayer(id, name, kind);
        case 'Copycat': return new CopycatPlayer(id, name, kind);
        case 'Smooth': return new SmoothPlayer(id, name, kind);
        case 'Gambler': return new GamblerPlayer(id, name, kind);
        case 'Mathematician': return new Mathematician(id, name, kind);
        case 'Kuzuryu': return new Kuzuryu(id, name, kind);
        default: return new RationalPlayer(id, name, 'Rational');
    }
}

// Probability of encountering each AI Player
// Base is 1 as Rational
export const TYPE_WEIGHTS = {
    Rational: 1,
    SwingRational: 1,
    Saboteur: 0.1, // who'd risk his/her own life?
    Quitter: 0.5,  // it's me when HP is low
    Copycat: 0.7,  // it's me when HP is low (Ctl+V)
    Smooth: 1,
    Mathematician: 1,
    Gambler: 0.8,
    Kuzuryu: 0.6,  // @All 一回、死んでみる？
    Human: 0      
    // Human will be filtered out regardless (apart from .filter()s)
} as const;
