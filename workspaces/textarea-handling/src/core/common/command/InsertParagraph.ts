import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { insertParagraph } from '../mutate/insertParagraph';

export const InsertParagraph = Command.define('contenteditable.insertParagraph');

CommandService.registerCommand(InsertParagraph, (command, editor) => {
    editor.updateState(insertParagraph);
});
