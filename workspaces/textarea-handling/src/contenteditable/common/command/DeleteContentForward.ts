import { Command } from '../../../core/common/Command';
import { CommandService } from '../../../core/common/CommandService';
import { Editor } from '../../../core/common/Editor';
import { deleteContentForward } from '../updater/deleteContentForward';

export const DeleteContentForward = Command.define('contenteditable.deleteContentForward');

CommandService.registerCommand(DeleteContentForward, (command, container) => {
    container.get(Editor.ServiceKey).updateState(deleteContentForward);
});
