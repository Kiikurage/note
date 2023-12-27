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
