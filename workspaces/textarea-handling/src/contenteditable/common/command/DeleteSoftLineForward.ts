import { CommandService } from '../../../command/CommandService';
import { Command } from '../../../command/Command';
import { Editor } from '../../../core/Editor';
import { PositionMap } from '../../PositionMap';
import { Cursor } from '../../../core/Cursor';

export const DeleteSoftLineForward = Command.define('contenteditable.deleteSoftLineForward');

CommandService.registerCommand(DeleteSoftLineForward, (command, container) => {
    const positionMap = container.get(PositionMap.ServiceKey);
    const editor = container.get(Editor.ServiceKey);

    positionMap.modifySelection('extend', 'forward', 'lineboundary');
    const selection = positionMap.getSelection();
    if (selection === null) return;

    editor.updateState((state) => state.setCursor(Cursor.of(selection.anchor, selection.focus)).deleteSelectedRange());
});
