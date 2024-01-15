/**
 * Throw an error with the given message.
 */
export function unreachable(message = 'Unreachable path'): never {
    throw new Error(message);
}
