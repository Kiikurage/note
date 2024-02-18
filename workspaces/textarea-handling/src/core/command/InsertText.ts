import { Command } from '../Command';
import { CommandService } from '../CommandService';
import { insertText } from '../operator/insertText';

export const InsertText = Command.define('contenteditable.insertText').withParams<{ text: string }>();

CommandService.registerCommand(InsertText, (command, editor) => {
    editor.updateState((state) => insertText(state, command.text));
});
