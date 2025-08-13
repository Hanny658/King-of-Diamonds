import type { IPlayer } from './IPlayer';
import type { Personality } from './types';
import { RationalPlayer } from './players/RationalPlayer';
import { SwingRationalPlayer } from './players/SwingRationalPlayer';
import { SaboteurPlayer } from './players/SaboteurPlayer';
import { QuitterPlayer } from './players/QuitterPlayer';
import { CopycatPlayer } from './players/CopycatPlayer';
import { SmoothPlayer } from './players/SmoothPlayer';
import { MultiStepPlayer } from './players/MultiStepPlayer';
import { GamblerPlayer } from './players/GamblerPlayer';
import { HalfKnowledgeKing } from './players/HalfKnowledgeKing';
import { DualModeAlice } from './players/DualModeAlice';

export const ALL_KINDS: Personality[] = [
    'Rational', 'SwingRational', 'Saboteur', 'Quitter', 'Copycat',
    'Smooth', 'MultiStep', 'Gambler', 'HalfKnowledgeKing', 'DualModeAlice'
];

export const SINGLETON_KINDS: Personality[] = [
    'HalfKnowledgeKing', 'DualModeAlice'
];

export function createPlayer(kind: Personality, id: number, name: string): IPlayer {
    switch (kind) {
        case 'Rational': return new RationalPlayer(id, name, kind);
        case 'SwingRational': return new SwingRationalPlayer(id, name, kind);
        case 'Saboteur': return new SaboteurPlayer(id, name, kind);
        case 'Quitter': return new QuitterPlayer(id, name, kind);
        case 'Copycat': return new CopycatPlayer(id, name, kind);
        case 'Smooth': return new SmoothPlayer(id, name, kind);
        case 'MultiStep': return new MultiStepPlayer(id, name, kind);
        case 'Gambler': return new GamblerPlayer(id, name, kind);
        case 'HalfKnowledgeKing': return new HalfKnowledgeKing(id, name, kind);
        case 'DualModeAlice': return new DualModeAlice(id, name, kind);
        default: return new RationalPlayer(id, name, 'Rational');
    }
}
