import { getKeyBindingService } from '../core/KeyBindingService';

export function initKeyBindingService() {
    const keyBindingService = getKeyBindingService();

    document.addEventListener('keydown', (ev) => {
        keyBindingService.handleKeyDown({
            key: ev.key,
            shiftKey: ev.shiftKey,
            altKey: ev.altKey,
            cmdKey: ev.metaKey,
            ctrlKey: ev.ctrlKey,
            preventDefault: () => ev.preventDefault(),
        });
    });
}
