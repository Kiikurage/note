import { Command } from '../Command';
import { Editor } from '../Editor';
import { CommandService } from '../CommandService';

export const DeleteContentForward = Command.define('contenteditable.deleteContentForward');

CommandService.registerCommand(DeleteContentForward, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.deleteForward();
});
