import { Command } from '../../../core/common/Command';
import { Editor } from '../../../core/common/Editor';
import { CommandService } from '../../../core/common/CommandService';

export const InsertText = Command.define('contenteditable.insertText').withParams<{ text: string }>();

CommandService.registerCommand(InsertText, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.insertText(command.text);
});
