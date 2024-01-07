import { Command } from '../core/common/Command';
import { CommandService } from '../core/common/CommandService';
import { EditorHistory } from './EditorHistory';

export const HistoryUndo = Command.define('history.undo');

CommandService.registerCommand(HistoryUndo, (command, container) => {
    container.get(EditorHistory.ServiceKey).undo();
});
