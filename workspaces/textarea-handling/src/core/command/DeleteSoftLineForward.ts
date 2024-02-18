import { CommandService } from '../CommandService';
import { Command } from '../Command';
import { setCursor } from '../operator/setCursor';
import { createCursor } from '../Cursor';
import { deleteContentForward } from '../operator/deleteContentForward';
import { PointMap } from '../../dom/PointMap';

export const DeleteSoftLineForward = Command.define('contenteditable.deleteSoftLineForward');

CommandService.registerCommand(DeleteSoftLineForward, (command, editor) => {
    const pointMap = editor.getComponent(PointMap.ComponentKey);

    const selection = pointMap.modifySelection('extend', 'forward', 'lineboundary');
    if (selection === null) return;

    editor.updateState((state) => {
        state = setCursor(state, createCursor(selection.anchor, selection.focus));
        state = deleteContentForward(state);

        return state;
    });
});
