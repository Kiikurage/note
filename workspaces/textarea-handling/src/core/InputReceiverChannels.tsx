import { Channel, Disposable } from '../lib';

export class InputReceiverChannels extends Disposable {
    readonly onFocusStateUpdate = this.register(
        new Channel<{
            active: boolean;
            rootFocused: boolean;
        }>(),
    );
    readonly onInsert = this.register(new Channel<string>());
    readonly onCompositionChange = this.register(new Channel<string>());
    readonly onCompositionEnd = this.register(new Channel<string>());
    readonly onKeyDown = this.register(
        new Channel<{
            key: string;
            shiftKey: boolean;
            ctrlKey: boolean;
            altKey: boolean;
            metaKey: boolean;
            preventDefault(): void;
        }>(),
    );
}
