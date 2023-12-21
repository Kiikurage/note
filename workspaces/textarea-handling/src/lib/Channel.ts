import { Disposable, IDisposable } from './Disposable';

export class Channel<T = void> extends Disposable {
    private readonly callbacks = new Set<(value: T) => void>();

    /**
     * Add listener to this channel. Return the disposable to remove the listener
     *
     * @example
     *
     *     class MyDisposable extends Disposable {
     *         initialize() {
     *             // This listener will be removed when MyDisposable is disposed.
     *             this.register(channel.addListener((value) => console.log(value)));
     *         }
     *     }
     */
    addListener(callback: (value: T) => void): IDisposable {
        this.callbacks.add(callback);
        return { dispose: () => this.removeListener(callback) };
    }

    removeListener(callback: (value: T) => void): this {
        this.callbacks.delete(callback);
        return this;
    }

    fire(value: T) {
        this.callbacks.forEach((callback) => callback(value));
    }
}

/**
 * Helper function to add channel listener safely in Disposable.
 *
 * @example
 *
 *     class MyDisposable extends Disposable {
 *         constructor() {
 *             super();
 *             this.register(addListener(channel, (value) => console.log(value)));
 *         }
 *     }
 */
export function addListener<T>(channel: Channel<T>, callback: (value: T) => void): IDisposable {
    channel.addListener(callback);

    return {
        dispose() {
            channel.removeListener(callback);
        },
    };
}
