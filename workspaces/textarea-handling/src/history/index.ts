import { extension } from '../extension/Extension';
import { KeyBindingExtension } from '../keybinding';
import { KeyBindingService } from '../keybinding/common/KeyBindingService';
import { CommandService } from '../command/CommandService';
import { HistoryUndo } from './HistoryUndo';
import { HistoryRedo } from './HistoryRedo';
import { EditorHistory } from './EditorHistory';
import { Editor } from '../core/common/Editor';

export const HistoryExtension = extension({
    name: 'History',
    dependencies: [KeyBindingExtension],
    setup(editor: Editor) {
        const historyService = editor.getComponent(EditorHistory.ComponentKey);

        const keybindingService = editor.getComponent(KeyBindingService.ComponentKey);
        const commandService = editor.getComponent(CommandService.ComponentKey);

        keybindingService
            .registerBinding({ key: 'cmd+z', command: 'history.undo' })
            .registerBinding({ key: 'cmd+shift+z', command: 'history.redo' })
            .registerBinding({ key: 'ctrl+z', command: 'history.undo' })
            .registerBinding({ key: 'ctrl+shift+z', command: 'history.redo' })
            .registerHandler('history.undo', () => commandService.exec(HistoryUndo()))
            .registerHandler('history.redo', () => commandService.exec(HistoryRedo()));
    },
});
