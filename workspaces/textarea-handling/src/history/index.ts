import { DIContainer } from '../lib/DIContainer';
import { extension } from '../extension/Extension';
import { KeyBindingExtension } from '../keybinding';
import { KeyBindingService } from '../keybinding/common/KeyBindingService';
import { CommandService } from '../command/CommandService';
import { HistoryUndo } from './HistoryUndo';
import { HistoryRedo } from './HistoryRedo';
import { EditorHistory } from './EditorHistory';

export const HistoryExtension = extension({
    name: 'History',
    dependencies: [KeyBindingExtension],
    setup(container: DIContainer) {
        const historyService = container.get(EditorHistory.ServiceKey);

        const keybindingService = container.get(KeyBindingService.ServiceKey);
        const commandService = container.get(CommandService.ServiceKey);

        keybindingService
            .registerBinding({ key: 'cmd+z', command: 'history.undo' })
            .registerBinding({ key: 'cmd+shift+z', command: 'history.redo' })
            .registerBinding({ key: 'ctrl+z', command: 'history.undo' })
            .registerBinding({ key: 'ctrl+shift+z', command: 'history.redo' })
            .registerHandler('history.undo', () => commandService.exec(HistoryUndo()))
            .registerHandler('history.redo', () => commandService.exec(HistoryRedo()));
    },
});
