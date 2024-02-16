import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { deleteContentForward } from '../mutate/deleteContentForward';

export const DeleteContentForward = Command.define('contenteditable.deleteContentForward');

CommandService.registerCommand(DeleteContentForward, (command, editor) => {
    editor.updateState(deleteContentForward);
});
