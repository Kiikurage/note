import { Command } from '../core/Command';
import { CommandService } from '../core/CommandService';
import { EditorHistory } from './EditorHistory';

export const HistoryRedo = Command.define('history.redo');

CommandService.registerCommand(HistoryRedo, (command, editor) => {
    editor.getComponent(EditorHistory.ComponentKey).redo();
});
