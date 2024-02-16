import { CommandService } from '../CommandService';
import { Command } from '../Command';
import { setCursor } from '../mutation/setCursor';
import { createCursor } from '../Cursor';
import { deleteContentForward } from '../mutation/deleteContentForward';
import { PointMap } from '../../dom/PointMap';

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
