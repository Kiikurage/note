export function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        debugger;
        throw new Error(message);
    }
}

export function assertValueInRange(
    value: number,
    min: number,
    max: number,
    message: string = `Value out of range: value=${value} range=[${min}, ${max}]`,
) {
    assert(min <= value && value <= max, message);
}

export function assertIsInstance<T>(
    instance: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctor: new (...args: any[]) => T,
    message: string = `Value is not instance of ${ctor.name}`,
): asserts instance is T {
    assert(instance instanceof ctor, message);
}
