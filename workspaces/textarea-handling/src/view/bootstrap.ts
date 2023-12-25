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
        .registerBinding({ key: 'backspace', command: 'deleteLeft' })
        .registerBinding({ key: 'delete', command: 'deleteRight' })
        .registerBinding({ key: 'left', command: 'cursorLeft' })
        .registerBinding({ key: 'shift+left', command: 'cursorLeftSelect' })
        .registerBinding({ key: 'right', command: 'cursorRight' })
        .registerBinding({ key: 'shift+right', command: 'cursorRightSelect' });

    if (isMac()) {
        keyBindingService
            .registerBinding({ key: 'cmd+a', command: 'editor.action.selectAll' })
            .registerBinding({ key: 'cmd+left', command: 'cursorHome' })
            .registerBinding({ key: 'cmd+shift+left', command: 'cursorHomeSelect' })
            .registerBinding({ key: 'cmd+right', command: 'cursorEnd' })
            .registerBinding({ key: 'cmd+shift+right', command: 'cursorEndSelect' });
    }

    if (isWin()) {
        keyBindingService
            .registerBinding({ key: 'ctrl+a', command: 'editor.action.selectAll' })
            .registerBinding({ key: 'ctrl+left', command: 'cursorHome' })
            .registerBinding({ key: 'ctrl+shift+left', command: 'cursorHomeSelect' })
            .registerBinding({ key: 'ctrl+right', command: 'cursorEnd' })
            .registerBinding({ key: 'ctrl+shift+right', command: 'cursorEndSelect' });
    }
}
