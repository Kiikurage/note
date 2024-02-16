import { CommandService } from '../../../command/CommandService';
import { Command } from '../../../command/Command';
import { deleteContentBackward } from '../mutate/deleteContentBackward';

export const DeleteContentBackward = Command.define('contenteditable.deleteContentBackward');

CommandService.registerCommand(DeleteContentBackward, (command, editor) => {
    editor.updateState(deleteContentBackward);
});
