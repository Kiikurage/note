import { Command } from '../Command';
import { Editor } from '../Editor';
import { CommandService } from '../CommandService';

export const DeleteHardLineForward = Command.define('contenteditable.deleteHardLineForward');

CommandService.registerCommand(DeleteHardLineForward, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.moveToLineEndWithSelect();
    editor.deleteForward();
});
