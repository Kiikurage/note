import { CommandService } from '../../../command/CommandService';
import { Command } from '../../../command/Command';
import { PositionMap } from '../../react/PositionMap';
import { setCursor } from '../mutate/setCursor';
import { Cursor } from '../Cursor';
import { deleteContentBackward } from '../mutate/deleteContentBackward';

export const DeleteSoftLineBackward = Command.define('contenteditable.deleteSoftLineBackward');

CommandService.registerCommand(DeleteSoftLineBackward, async (command, editor) => {
    const positionMap = editor.getComponent(PositionMap.ComponentKey);

    const selection = positionMap.modifySelection('extend', 'backward', 'lineboundary');
    if (selection === null) return;

    editor.updateState((state) => {
        state = setCursor(state, Cursor.of(selection.anchor, selection.focus));
        state = deleteContentBackward(state);

        return state;
    });
});
