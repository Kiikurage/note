import { Disposable } from './Disposable';

export class EventTargetHolder<T extends EventTarget> extends Disposable {
    private readonly callbacksMap = new Map<string, Set<(ev: Event) => void>>();

    constructor(readonly target: T) {
        super();
    }

    private readonly handler = (ev: Event) => {
        this.callbacksMap.get(ev.type)?.forEach((callback) => callback(ev));
    };

    addListener<K extends keyof HTMLElementEventMap>(type: K, handler: (ev: HTMLElementEventMap[K]) => void): this;
    addListener(type: string, callback: (ev: Event) => void): this;
    addListener(type: string, callback: (ev: Event) => void): this {
        let callbacks = this.callbacksMap.get(type);
        if (callbacks === undefined) {
            callbacks = new Set<(ev: Event) => void>();
            this.callbacksMap.set(type, callbacks);
            this.target.addEventListener(type, this.handler);
        }
        callbacks.add(callback);
        return this;
    }

    removeListener<K extends keyof HTMLElementEventMap>(type: K, handler: (ev: HTMLElementEventMap[K]) => void): this;
    removeListener(type: string, callback: (ev: Event) => void): this;
    removeListener(type: string, callback: (ev: Event) => void): this {
        const callbacks = this.callbacksMap.get(type);
        if (callbacks === undefined) return this;

        callbacks.delete(callback);
        if (callbacks.size === 0) {
            this.callbacksMap.delete(type);
            this.target.removeEventListener(type, this.handler);
        }
        return this;
    }

    public override dispose() {
        for (const type of this.callbacksMap.keys()) {
            this.target.removeEventListener(type, this.handler);
        }
        this.callbacksMap.clear();

        super.dispose();
    }
}

export function eventTarget<T extends EventTarget>(eventTarget: T): EventTargetHolder<T> {
    return new EventTargetHolder(eventTarget);
}
