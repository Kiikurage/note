export function binarySearch(array: number[], target: number): number {
    let from = 0;
    let to = array.length;
    while (to - from > 1) {
        const mid = from + ((to - from) >> 1);
        if (array[mid] === target) {
            return mid;
        } else if (array[mid] < target) {
            from = mid;
        } else {
            to = mid;
        }
    }
    return from;
}
