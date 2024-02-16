import { CommandService } from '../CommandService';
import { Command } from '../Command';
import { PointMap } from '../../dom/PointMap';
import { setCursor } from '../mutation/setCursor';
import { createCursor } from '../Cursor';
import { deleteContentBackward } from '../mutation/deleteContentBackward';

export const DeleteSoftLineBackward = Command.define('contenteditable.deleteSoftLineBackward');

CommandService.registerCommand(DeleteSoftLineBackward, async (command, editor) => {
    const pointMap = editor.getComponent(PointMap.ComponentKey);

    const selection = pointMap.modifySelection('extend', 'backward', 'lineboundary');
    if (selection === null) return;

    editor.updateState((state) => {
        state = setCursor(state, createCursor(selection.anchor, selection.focus));
        state = deleteContentBackward(state);

        return state;
    });
});