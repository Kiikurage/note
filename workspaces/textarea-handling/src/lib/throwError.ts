/**
 * Throw an error with the given message. You can use this function in the middle of expression.
 *
 * @example
 * const item = repository.findById(id) ?? throwError('not found');
 */
export function throwError(message: string): never {
    throw new Error(message);
}
