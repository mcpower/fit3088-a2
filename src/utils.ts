/**
 * Flattens an array one level.
 * @param arr The array to flatten.
 */
export function flatten<T>(arr: T[][]): T[] {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

/**
 * Flattens an array one level while creating a "lookup" array.
 * This lookup array has the same dimension as the input array,
 * and gives indices to the flattened array.
 * 
 * Useful for figuring out vertex indices.
 * 
 * @param arr The array to flatten.
 */
export function flattenWithLookup<T>(arr: T[][]): {flattened: T[]; lookup: number[][]} {
    let flattened: T[] = [];
    let lookup: number[][] = [];
    arr.forEach(val => {
        let lookupRow: number[] = [];
        val.forEach(el => {
            lookupRow.push(flattened.length);
            flattened.push(el);
        });
        lookup.push(lookupRow);
    });
    return {flattened, lookup};
}
