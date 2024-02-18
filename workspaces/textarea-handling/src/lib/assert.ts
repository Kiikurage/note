export function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        // eslint-disable-next-line no-debugger
        debugger;
        throw new Error(message);
    }
}
