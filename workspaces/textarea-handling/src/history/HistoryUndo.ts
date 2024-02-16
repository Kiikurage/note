import { Command } from '../command/Command';
import { CommandService } from '../command/CommandService';
import { EditorHistory } from './EditorHistory';

export const HistoryUndo = Command.define('history.undo');

CommandService.registerCommand(HistoryUndo, (command, editor) => {
    editor.getComponent(EditorHistory.ComponentKey).undo();
});
