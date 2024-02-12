import { CommandService } from '../../../command/CommandService';
import { Command } from '../../../command/Command';
import { Editor } from '../Editor';
import { PositionMap } from '../../react/PositionMap';
import { setCursor } from '../mutate/setCursor';
import { Cursor } from '../Cursor';
import { deleteContentForward } from '../mutate/deleteContentForward';

export const DeleteSoftLineForward = Command.define('contenteditable.deleteSoftLineForward');

CommandService.registerCommand(DeleteSoftLineForward, async (command, container) => {
    const positionMap = container.get(PositionMap.ServiceKey);
    const editor = container.get(Editor.ServiceKey);

    const selection = positionMap.modifySelection('extend', 'forward', 'lineboundary');
    if (selection === null) return;

    editor.updateState((state) => {
        state = setCursor(state, Cursor.of(selection.anchor, selection.focus));
        state = deleteContentForward(state);

        return state;
    });
});
