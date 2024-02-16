import { CommandService } from '../../../command/CommandService';
import { Command } from '../../../command/Command';
import { PointMap } from '../../react/PointMap';
import { setCursor } from '../mutation/setCursor';
import { createCursor } from '../Cursor';
import { deleteContentForward } from '../mutation/deleteContentForward';

export const DeleteSoftLineForward = Command.define('contenteditable.deleteSoftLineForward');

CommandService.registerCommand(DeleteSoftLineForward, async (command, editor) => {
    const pointMap = editor.getComponent(PointMap.ComponentKey);

    const selection = pointMap.modifySelection('extend', 'forward', 'lineboundary');
    if (selection === null) return;

    editor.updateState((state) => {
        state = setCursor(state, createCursor(selection.anchor, selection.focus));
        state = deleteContentForward(state);

        return state;
    });
});
