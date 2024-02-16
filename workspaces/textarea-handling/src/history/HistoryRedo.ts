import { Command } from '../command/Command';
import { CommandService } from '../command/CommandService';
import { EditorHistory } from './EditorHistory';

export const HistoryRedo = Command.define('history.redo');

CommandService.registerCommand(HistoryRedo, (command, editor) => {
    editor.getComponent(EditorHistory.ComponentKey).redo();
});
