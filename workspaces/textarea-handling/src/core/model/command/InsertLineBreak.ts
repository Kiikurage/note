import { Command } from '../Command';
import { Editor } from '../Editor';
import { CommandService } from '../CommandService';

export const InsertLineBreak = Command.define('contenteditable.insertLineBreak');

CommandService.registerCommand(InsertLineBreak, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.insertText('\n');
});
