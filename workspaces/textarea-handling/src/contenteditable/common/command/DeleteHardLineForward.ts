import { Command } from '../../../core/common/Command';
import { Editor } from '../../../core/common/Editor';
import { CommandService } from '../../../core/common/CommandService';

export const DeleteHardLineForward = Command.define('contenteditable.deleteHardLineForward');

CommandService.registerCommand(DeleteHardLineForward, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.moveToLineEndWithSelect();
    editor.deleteForward();
});
