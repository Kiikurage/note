import { KeyBindingService } from './common/KeyBindingService';
import { Disposable } from '../lib';

export class KeyEventsInterceptor extends Disposable {
    constructor(private readonly service: KeyBindingService) {
        super();

        document.addEventListener('keydown', this.handleKeyDown);
    }

    dispose() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    private readonly handleKeyDown = (ev: KeyboardEvent) => {
        this.service.handleKeyDown({
            key: ev.key,
            ctrlKey: ev.ctrlKey,
            shiftKey: ev.shiftKey,
            altKey: ev.altKey,
            cmdKey: ev.metaKey,
            preventDefault() {
                ev.preventDefault();
            },
        });
    };
}
