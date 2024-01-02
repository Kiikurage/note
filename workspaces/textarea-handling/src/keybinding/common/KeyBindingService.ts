import { DIContainer } from '../../core/common/DIContainer';
import { Disposable } from '../../lib';
import { Logger } from '../../lib/logger';
import { KeyEventsInterceptor } from '../view/KeyEventsInterceptor';

export interface IKeyboardEvent {
    key: string;
    shiftKey: boolean;
    altKey: boolean;
    cmdKey: boolean;
    ctrlKey: boolean;

    preventDefault(): void;
}

export interface KeyBindingEntry {
    key: string;
    command: string;
}

export class KeyBindingService extends Disposable {
    static readonly ServiceKey = DIContainer.register(() => new KeyBindingService());

    private readonly bindings: KeyBindingEntry[] = [];
    private readonly handlers = new Map<string, () => void>();
    private readonly logger = new Logger(KeyBindingService.name);
    private readonly interceptor = this.register(new KeyEventsInterceptor(this));

    dispose() {
        this.handlers.clear();
        super.dispose();
    }

    registerBinding(entry: KeyBindingEntry): this {
        this.bindings.push(KeyBindingService.canonicalizeEntry(entry));
        return this;
    }

    registerHandler(command: string, handler: () => void): this {
        this.handlers.set(command, handler);
        return this;
    }

    handleKeyDown(ev: IKeyboardEvent) {
        const { key, shiftKey, altKey, cmdKey, ctrlKey } = ev;
        if (key === 'Meta' || key === 'Control' || key === 'Alt' || key === 'Shift') return;

        const keys: string[] = [];

        keys.push(KeyBindingService.normalizeKeyName(key));
        if (shiftKey) keys.push(KEY_NAME_SHIFT);
        if (altKey) keys.push(KEY_NAME_ALT);
        if (cmdKey) keys.push(KEY_NAME_CMD);
        if (ctrlKey) keys.push(KEY_NAME_CTRL);

        const keyPattern = KeyBindingService.stringify(keys);
        const command = this.bindings.find((binding) => binding.key === keyPattern)?.command;
        if (command === undefined) return;

        const handler = this.handlers.get(command);
        if (handler === undefined) {
            this.logger.warn(`No handler found for command: ${command}`);
            return;
        }

        handler();
        ev.preventDefault();
    }

    private static parse(keyPattern: string): string[] {
        return keyPattern
            .split('+')
            .map((key) => key.trim())
            .map((key) => KeyBindingService.normalizeKeyName(key));
    }

    private static stringify(keys: string[]): string {
        return keys.sort().join('+');
    }

    private static canonicalizeEntry(entry: KeyBindingEntry): KeyBindingEntry {
        return {
            command: entry.command,
            key: entry.key
                .split(' ')
                .map((keys) => KeyBindingService.parse(keys))
                .map((keys) => KeyBindingService.stringify(keys))
                .join(' '),
        };
    }

    private static normalizeKeyName(key: string) {
        return (
            {
                ArrowLeft: KEY_NAME_LEFT,
                ArrowRight: KEY_NAME_RIGHT,
                ArrowUp: KEY_NAME_UP,
                ArrowDown: KEY_NAME_DOWN,
                Meta: KEY_NAME_CMD,
                Control: KEY_NAME_CTRL,
                Alt: KEY_NAME_ALT,
                Shift: KEY_NAME_SHIFT,
            }[key] ?? key.toLowerCase()
        );
    }
}

const KEY_NAME_LEFT = 'left';
const KEY_NAME_RIGHT = 'right';
const KEY_NAME_UP = 'up';
const KEY_NAME_DOWN = 'down';
const KEY_NAME_CMD = 'cmd';
const KEY_NAME_CTRL = 'ctrl';
const KEY_NAME_ALT = 'alt';
const KEY_NAME_SHIFT = 'shift';
