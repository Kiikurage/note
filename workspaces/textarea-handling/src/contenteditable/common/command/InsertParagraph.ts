import { Command } from '../../../core/common/Command';
import { CommandService } from '../../../core/common/CommandService';
import { Editor } from '../../../core/common/Editor';
import { insertParagraph } from '../updater/insertParagraph';

export const InsertParagraph = Command.define('contenteditable.insertParagraph');

CommandService.registerCommand(InsertParagraph, (command, container) => {
    container.get(Editor.ServiceKey).updateState(insertParagraph);
});
