import { Command } from '../core/Command';
import { CommandService } from '../core/CommandService';
import { EditorHistory } from './EditorHistory';

export const HistoryUndo = Command.define('history.undo');

CommandService.registerCommand(HistoryUndo, (command, editor) => {
    editor.getComponent(EditorHistory.ComponentKey).undo();
});
