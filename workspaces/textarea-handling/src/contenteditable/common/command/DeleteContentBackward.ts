import { Command } from '../../../core/common/Command';
import { Editor } from '../../../core/common/Editor';
import { CommandService } from '../../../core/common/CommandService';

export const DeleteContentBackward = Command.define('contenteditable.deleteContentBackward');

CommandService.registerCommand(DeleteContentBackward, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.deleteBackward();
});
