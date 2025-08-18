import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import type { Personality } from '../models/types';
import { ALL_KINDS, SINGLETON_KINDS, TYPE_WEIGHTS } from '../models/factory';

/* Disabling counter for now */
//let counter = 1; // ensure uniqueness even if RNG collides

export function makeShortName() {
    const base = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        length: 2,
        separator: '-',
        style: 'lowerCase',
    });
    return base;
    // return `${base}-${counter++}`; // e.g., "brave-otter-1"
}

// Weighted pick from parallel arrays
function weightedPick<T>(items: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    if (total <= 0) throw new Error('weightedPick: total weight must be > 0');
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
    }
    return items[items.length - 1]; // fallback
}

/**
 * Weighted kind selection.
 * - Respects SINGLETON_KINDS not yet available (filters taken).
 * - Excludes 'Human'.
 * - Uses weights[kind] if provided; default weight = 1.
 */
export function randomAssignableKind(taken: Set<Personality>): Personality {
    // Filter by availability (singletons) + exclude Human
    const candidates = ALL_KINDS.filter(k =>
        (SINGLETON_KINDS.includes(k) ? !taken.has(k) : true)
    ).filter(k => k !== 'Human');

    if (candidates.length === 0) {
        // Safety fallback: if everything filtered out, assure it's Rational
        return 'Rational';
    }

    // Build weights array (default 1, clamp to 0 if negative/NaN)
    const ws = candidates.map(k => {
        const w = TYPE_WEIGHTS[k];
        return Number.isFinite(w!) && (w as number) > 0 ? (w as number) : 1;
    });

    // pick by weight
    return weightedPick(candidates, ws);
}
