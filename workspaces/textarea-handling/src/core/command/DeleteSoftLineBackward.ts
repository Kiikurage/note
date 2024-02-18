import { CommandService } from '../CommandService';
import { Command } from '../Command';
import { PointMap } from '../../dom/PointMap';
import { setCursor } from '../operator/setCursor';
import { createCursor } from '../Cursor';
import { deleteContentBackward } from '../operator/deleteContentBackward';

export const DeleteSoftLineBackward = Command.define('contenteditable.deleteSoftLineBackward');

CommandService.registerCommand(DeleteSoftLineBackward, (command, editor) => {
    const pointMap = editor.getComponent(PointMap.ComponentKey);

    const selection = pointMap.modifySelection('extend', 'backward', 'lineboundary');
    if (selection === null) return;

    editor.updateState((state) => {
        state = setCursor(state, createCursor(selection.anchor, selection.focus));
        state = deleteContentBackward(state);

        return state;
    });
});
