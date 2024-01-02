import { Command } from '../Command';
import { Editor } from '../Editor';
import { CommandService } from '../CommandService';

export const DeleteHardLineBackward = Command.define('contenteditable.deleteHardLineBackward');

CommandService.registerCommand(DeleteHardLineBackward, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.moveToLineBeginWithSelect();
    editor.deleteBackward();
});
