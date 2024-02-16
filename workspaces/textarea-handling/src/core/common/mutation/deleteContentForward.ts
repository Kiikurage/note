import { createCursor } from '../Cursor';
import { EditorState } from '../EditorState';
import { deleteSelectedRange } from './deleteSelectedRange';

export function deleteContentForward(state: EditorState): EditorState {
    if (!state.cursor.collapsed) return deleteSelectedRange(state);

    const result = state.cursor.focus.node.deleteContentForward(state.cursor.focus.offset);
    return {
        ...state,
        cursor: createCursor(result.pointAfterDeletion),
    };
}
