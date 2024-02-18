export function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        debugger;
        throw new Error(message);
    }
}
