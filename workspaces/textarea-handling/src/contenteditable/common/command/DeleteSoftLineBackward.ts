import { CommandService } from '../../../command/CommandService';
import { Command } from '../../../command/Command';
import { Editor } from '../../../core/Editor';
import { PositionMap } from '../../PositionMap';
import { Cursor } from '../../../core/Cursor';

export const DeleteSoftLineBackward = Command.define('contenteditable.deleteSoftLineBackward');

CommandService.registerCommand(DeleteSoftLineBackward, (command, container) => {
    const positionMap = container.get(PositionMap.ServiceKey);
    const editor = container.get(Editor.ServiceKey);

    positionMap.modifySelection('extend', 'backward', 'lineboundary');
    const selection = positionMap.getSelection();
    if (selection === null) return;

    editor.updateState((state) => state.setCursor(Cursor.of(selection.anchor, selection.focus)).deleteSelectedRange());
});
