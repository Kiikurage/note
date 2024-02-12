import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { Editor } from '../Editor';
import { insertParagraph } from '../mutate/insertParagraph';

export const InsertParagraph = Command.define('contenteditable.insertParagraph');

CommandService.registerCommand(InsertParagraph, (command, container) => {
    container.get(Editor.ServiceKey).updateState(insertParagraph);
});
