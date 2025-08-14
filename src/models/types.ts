export type Choice = { playerId: number; value: number };
export type RoundData = {
    roundNumber: number;
    choices: Choice[];
    average: number;  // raw average of choices
    target: number;   // T = 0.8 * average
    winnerId: number | null; // unique closest winner or null if none (shouldn’t happen given rules)
};

export type Personality =
    | 'Human'
    | 'Rational'
    | 'SwingRational'
    | 'Saboteur'
    | 'Quitter'
    | 'Copycat'
    | 'Smooth'
    | 'Gambler'
    | 'Mathematician'
    | 'Kuzuryu';

export type PlayerSnapshot = {
    id: number;
    name: string;
    kind: Personality;
    hp: number;
};
