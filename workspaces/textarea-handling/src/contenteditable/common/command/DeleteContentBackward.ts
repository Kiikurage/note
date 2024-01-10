import { CommandService } from '../../../command/CommandService';
import { Command } from '../../../command/Command';
import { Editor } from '../../../core/Editor';
import { deleteSelectedRange } from '../../../core/mutation/deleteAndMerge';
import { Cursor } from '../../../core/Cursor';
import { TextNode } from '../../../core/node/TextNode';

export const DeleteContentBackward = Command.define('contenteditable.deleteContentBackward');

CommandService.registerCommand(DeleteContentBackward, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => {
        if (!state.cursor.collapsed) return deleteSelectedRange(state);

        const caret = state.cursor.focus;
        const node = state.doc.get(caret.nodeId);
        if (node instanceof TextNode && caret.offset > 0) {
            return deleteSelectedRange(
                state.copy({
                    cursor: Cursor.of(caret.prev(), caret),
                }),
            );
        }

        return state;
    });
});
