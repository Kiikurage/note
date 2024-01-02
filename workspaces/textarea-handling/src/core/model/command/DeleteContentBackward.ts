import { Command } from '../Command';
import { Editor } from '../Editor';
import { CommandService } from '../CommandService';

export const DeleteContentBackward = Command.define('contenteditable.deleteContentBackward');

CommandService.registerCommand(DeleteContentBackward, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.deleteBackward();
});
