import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { insertText } from '../mutation/insertText';

export const InsertText = Command.define('contenteditable.insertText').withParams<{ text: string }>();

CommandService.registerCommand(InsertText, (command, editor) => {
    editor.updateState((state) => insertText(state, command.text));
});
