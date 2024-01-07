import { Command } from '../core/common/Command';
import { CommandService } from '../core/common/CommandService';
import { EditorHistory } from './EditorHistory';

export const HistoryRedo = Command.define('history.redo');

CommandService.registerCommand(HistoryRedo, (command, container) => {
    container.get(EditorHistory.ServiceKey).redo();
});
