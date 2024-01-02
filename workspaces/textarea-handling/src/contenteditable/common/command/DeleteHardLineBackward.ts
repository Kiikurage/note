import { Command } from '../../../core/common/Command';
import { Editor } from '../../../core/common/Editor';
import { CommandService } from '../../../core/common/CommandService';

export const DeleteHardLineBackward = Command.define('contenteditable.deleteHardLineBackward');

CommandService.registerCommand(DeleteHardLineBackward, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.moveToLineBeginWithSelect();
    editor.deleteBackward();
});
