import { Command } from '../../../core/common/Command';
import { Editor } from '../../../core/common/Editor';
import { CommandService } from '../../../core/common/CommandService';

export const InsertLineBreak = Command.define('contenteditable.insertLineBreak');

CommandService.registerCommand(InsertLineBreak, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.insertText('\n');
});
