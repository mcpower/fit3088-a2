export function flatten<T>(arr: T[][]): T[] {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

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
