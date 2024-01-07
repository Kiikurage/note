import { Command } from '../../../core/common/Command';
import { CommandService } from '../../../core/common/CommandService';
import { Editor } from '../../../core/common/Editor';
import { insertText } from '../updater/insertText';

export const InsertText = Command.define('contenteditable.insertText').withParams<{ text: string }>();

CommandService.registerCommand(InsertText, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => insertText(state, command.text));
});
