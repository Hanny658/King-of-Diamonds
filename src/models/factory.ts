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

export const ALL_KINDS: Personality[] = [
    'Rational', 'SwingRational', 'Saboteur', 'Quitter', 'Copycat',
    'Smooth', 'Gambler', 'Mathematician', 'Kuzuryu'
];

export const SINGLETON_KINDS: Personality[] = [
    'Kuzuryu'
];

export function createPlayer(kind: Personality, id: number, name: string): IPlayer {
    switch (kind) {
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
