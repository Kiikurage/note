import { useEditor } from './useEditor';
import { isMac, isWin } from '../lib/os';
import { getKeyBindingService } from '../core/KeyBindingService';
import { LayoutManagerProvider, useLayoutManager } from './useLayoutManager';
import { OverlayLayer } from './OverlayLayer';
import { InputReceiverLayer } from './InputReceiverLayer';
import { ContentLayer } from './ContentLayer';
import { EditorBaseView } from './EditorBaseView';

export const EditorView = () => {
    const editor = useEditor();
    const layoutManager = useLayoutManager();

    return (
        <LayoutManagerProvider value={layoutManager}>
            <EditorBaseView editor={editor}>
                <InputReceiverLayer editor={editor} />
                <ContentLayer editor={editor} />
                <OverlayLayer editor={editor} />
            </EditorBaseView>
        </LayoutManagerProvider>
    );
};

window.addEventListener('DOMContentLoaded', () => {
    const keyBindingService = getKeyBindingService();

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
            .registerBinding({ key: 'cmd+shift+right', command: 'cursorEndSelect' })
            .registerBinding({ key: 'cmd+c', command: 'editor.action.clipboardCopyAction' })
            .registerBinding({ key: 'cmd+x', command: 'editor.action.clipboardCutAction' })
            .registerBinding({ key: 'cmd+v', command: 'editor.action.clipboardPasteAction' });
    }

    if (isWin()) {
        keyBindingService
            .registerBinding({ key: 'ctrl+a', command: 'editor.action.selectAll' })
            .registerBinding({ key: 'ctrl+left', command: 'cursorHome' })
            .registerBinding({ key: 'ctrl+shift+left', command: 'cursorHomeSelect' })
            .registerBinding({ key: 'ctrl+right', command: 'cursorEnd' })
            .registerBinding({ key: 'ctrl+shift+right', command: 'cursorEndSelect' })
            .registerBinding({ key: 'ctrl+c', command: 'editor.action.clipboardCopyAction' })
            .registerBinding({ key: 'ctrl+x', command: 'editor.action.clipboardCutAction' })
            .registerBinding({ key: 'ctrl+v', command: 'editor.action.clipboardPasteAction' });
    }
});
