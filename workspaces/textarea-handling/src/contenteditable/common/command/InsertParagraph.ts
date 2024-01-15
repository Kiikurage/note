import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { Editor } from '../../../core/Editor';

export const InsertParagraph = Command.define('contenteditable.insertParagraph');

CommandService.registerCommand(InsertParagraph, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => state.insertParagraph());
});
