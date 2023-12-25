import { getKeyBindingService } from '../core/KeyBindingService';
import { isMac, isWin } from '../lib/os';

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

    keyBindingService
        .register({ key: 'backspace', command: 'deleteLeft' })
        .register({ key: 'delete', command: 'deleteRight' })
        .register({ key: 'left', command: 'cursorLeft' })
        .register({ key: 'shift+left', command: 'cursorLeftSelect' })
        .register({ key: 'right', command: 'cursorRight' })
        .register({ key: 'shift+right', command: 'cursorRightSelect' });

    if (isMac()) {
        keyBindingService
            .register({ key: 'cmd+a', command: 'editor.action.selectAll' })
            .register({ key: 'cmd+left', command: 'cursorHome' })
            .register({ key: 'cmd+shift+left', command: 'cursorHomeSelect' })
            .register({ key: 'cmd+right', command: 'cursorEnd' })
            .register({ key: 'cmd+shift+right', command: 'cursorEndSelect' });
    }

    if (isWin()) {
        keyBindingService
            .register({ key: 'ctrl+a', command: 'editor.action.selectAll' })
            .register({ key: 'ctrl+left', command: 'cursorHome' })
            .register({ key: 'ctrl+shift+left', command: 'cursorHomeSelect' })
            .register({ key: 'ctrl+right', command: 'cursorEnd' })
            .register({ key: 'ctrl+shift+right', command: 'cursorEndSelect' });
    }
}
