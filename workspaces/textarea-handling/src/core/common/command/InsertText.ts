import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { Editor } from '../Editor';
import { insertText } from '../mutate/insertText';

export const InsertText = Command.define('contenteditable.insertText').withParams<{ text: string }>();

CommandService.registerCommand(InsertText, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => insertText(state, command.text));
});
