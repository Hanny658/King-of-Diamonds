import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

let counter = 1; // ensure uniqueness even if RNG collides

export function makeShortName() {
    const base = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        length: 2,
        separator: '-',
        style: 'lowerCase',
    });
    return `${base}-${counter++}`; // e.g., "brave-otter-1"
}
