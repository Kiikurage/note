import { Command } from '../Command';
import { CommandService } from '../CommandService';
import { deleteContentForward } from '../mutation/deleteContentForward';

export const DeleteContentForward = Command.define('contenteditable.deleteContentForward');

CommandService.registerCommand(DeleteContentForward, (command, editor) => {
    editor.updateState(deleteContentForward);
});
