import { EditorState } from '../EditorState';
import { collapsed, createCursor, getCursorFrom, getCursorTo } from '../Cursor';
import { deleteContentBackward } from './deleteContentBackward';
import { comparePoint, createPoint } from '../Point';
import { setCursor } from './setCursor';

export function deleteSelectedRange(state: EditorState): EditorState {
    if (collapsed(state.cursor)) return state;

    const from = getCursorFrom(state.cursor);
    const to = getCursorTo(state.cursor);
    if (from.node === to.node) {
        const result = from.node.deleteContent(from.offset, to.offset);
        return { ...state, cursor: createCursor(result.pointAfterDeletion) };
    }

    while (comparePoint(from, getCursorTo(state.cursor)) < 0) {
        if (getCursorTo(state.cursor).node === from.node) {
            // Delete to the "from" point and complete the process
            state = setCursor(state, createCursor(from, getCursorTo(state.cursor)));
            state = deleteContentBackward(state);
            break;
        } else if (comparePoint(createPoint(getCursorTo(state.cursor).node, 0), from) < 0) {
            // "from" is middle of this node. Step into child nodes and find the exact "from" point
            const child = getCursorTo(state.cursor).node.children[getCursorTo(state.cursor).offset - 1];
            state = setCursor(state, createCursor(child, child.length));
        } else {
            // Normal deletion
            state = setCursor(state, createCursor(getCursorTo(state.cursor).node, 0, getCursorTo(state.cursor).offset));
            state = deleteContentBackward(state);
        }
    }

    return state;
}
