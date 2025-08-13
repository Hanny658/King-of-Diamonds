export const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));
export const roundInt = (x: number) => Math.round(x);

export const computeAverage = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
export const computeTarget = (avg: number) => 0.8 * avg;

export const randInt = (lo: number, hi: number) => {
    // inclusive bounds
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
};

export const pickRandom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// Returns indices of values with minimal absolute distance to target.
export function argMinDistances(values: number[], target: number): number[] {
    let best = Infinity; const idx: number[] = [];
    values.forEach((v, i) => {
        const d = Math.abs(v - target);
        if (d < best - 1e-9) { best = d; idx.length = 0; idx.push(i); }
        else if (Math.abs(d - best) <= 1e-9) { idx.push(i); }
    });
    return idx;
}