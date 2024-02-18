import { Command } from '../Command';
import { CommandService } from '../CommandService';
import { insertParagraph } from '../operator/insertParagraph';

export const InsertParagraph = Command.define('contenteditable.insertParagraph');

CommandService.registerCommand(InsertParagraph, (command, editor) => {
    editor.updateState(insertParagraph);
});
