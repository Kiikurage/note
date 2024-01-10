export function counter() {
    let count = 0;
    const fn = () => count++;
    return Object.assign(fn, {
        reset() {
            count = 0;
        },
    });
}
