import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { Editor } from '../Editor';
import { deleteContentForward } from '../mutate/deleteContentForward';

export const DeleteContentForward = Command.define('contenteditable.deleteContentForward');

CommandService.registerCommand(DeleteContentForward, (command, container) => {
    container.get(Editor.ServiceKey).updateState(deleteContentForward);
});
