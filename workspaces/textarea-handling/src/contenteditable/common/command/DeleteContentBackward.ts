import { CommandService } from '../../../core/common/CommandService';
import { Command } from '../../../core/common/Command';
import { Editor } from '../../../core/common/Editor';
import { deleteContentBackward } from '../updater/deleteContentBackward';

export const DeleteContentBackward = Command.define('contenteditable.deleteContentBackward');

CommandService.registerCommand(DeleteContentBackward, (command, container) => {
    container.get(Editor.ServiceKey).updateState(deleteContentBackward);
});
