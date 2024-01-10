import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { Editor } from '../../../core/Editor';
import { deleteSelectedRange } from '../../../core/mutation/deleteAndMerge';
import { Cursor } from '../../../core/Cursor';
import { TextNode } from '../../../core/node/TextNode';
import { nextPosition } from '../../../core/mutation/nextPosition';
import { Position } from '../../../core/Position';

export const DeleteContentForward = Command.define('contenteditable.deleteContentForward');

CommandService.registerCommand(DeleteContentForward, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => {
        if (!state.cursor.collapsed) return deleteSelectedRange(state);

        let caret: Position | null = state.cursor.focus;
        while (caret !== null) {
            const node = state.doc.get(caret.nodeId);
            if (node instanceof TextNode && caret.offset < node.length) {
                return deleteSelectedRange(
                    state.copy({
                        cursor: Cursor.of(caret, caret.next()),
                    }),
                );
            }
            caret = nextPosition(state.doc, caret);
        }

        return state;
    });
});
