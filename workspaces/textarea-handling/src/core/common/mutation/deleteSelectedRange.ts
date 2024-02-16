import { EditorState } from '../EditorState';
import { createCursor } from '../Cursor';
import { assert } from '../../../lib/assert';
import { deleteContentBackward } from './deleteContentBackward';
import { comparePoint, createPoint } from '../Point';
import { setCursor } from './setCursor';

export function deleteSelectedRange(state: EditorState): EditorState {
    if (state.cursor.collapsed) return state;

    const { from, to } = state.cursor;
    if (from.node === to.node) {
        const result = from.node.deleteContent(from.offset, to.offset);
        return { ...state, cursor: createCursor(result.pointAfterDeletion) };
    }

    state = { ...state, cursor: createCursor(to) };

    let count = 0;
    // eslint-disable-next-line no-constant-condition
    while (comparePoint(from, state.cursor.to) < 0) {
        assert(count++ < 1e4, 'Infinite loop');

        if (state.cursor.to.node === from.node) {
            // Delete to the "from" point and complete the process
            state = setCursor(state, createCursor(from, state.cursor.to));
            state = deleteContentBackward(state);
            break;
        } else if (comparePoint(createPoint(state.cursor.to.node, 0), from) < 0) {
            // "from" is middle of this node. Step into child nodes and find the exact "from" point
            const child = state.cursor.to.node.children[state.cursor.to.offset - 1];
            state = setCursor(state, createCursor(child, child.length));
        } else {
            // Normal deletion
            state = setCursor(state, createCursor(state.cursor.to.node, 0, state.cursor.to.offset));
            state = deleteContentBackward(state);
        }
    }

    return state;
}
