import { CommandService } from '../CommandService';
import { Command } from '../Command';
import { deleteContentBackward } from '../operator/deleteContentBackward';

export const DeleteContentBackward = Command.define('contenteditable.deleteContentBackward');

CommandService.registerCommand(DeleteContentBackward, (command, editor) => {
    editor.updateState(deleteContentBackward);
});
