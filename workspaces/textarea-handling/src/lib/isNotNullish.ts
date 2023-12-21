export function isNullish<T>(value: T | null | undefined): value is null | undefined {
    return value === null || value === undefined;
}

export function isNotNullish<T>(value: T | null | undefined): value is T {
    return !isNullish(value);
}
