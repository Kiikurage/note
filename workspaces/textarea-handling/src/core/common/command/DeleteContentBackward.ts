import { CommandService } from '../../../command/CommandService';
import { Command } from '../../../command/Command';
import { Editor } from '../Editor';
import { deleteContentBackward } from '../mutate/deleteContentBackward';

export const DeleteContentBackward = Command.define('contenteditable.deleteContentBackward');

CommandService.registerCommand(DeleteContentBackward, (command, container) => {
    container.get(Editor.ServiceKey).updateState(deleteContentBackward);
});
