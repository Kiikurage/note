import { createCursor } from '../Cursor';
import { EditorState } from '../EditorState';
import { deleteSelectedRange } from './deleteSelectedRange';

export function insertParagraph(state: EditorState): EditorState {
    if (!state.cursor.collapsed) state = deleteSelectedRange(state);

    const result = state.cursor.focus.node.insertParagraph(state.cursor.focus.offset);
    return {
        ...state,
        cursor: createCursor(result.pointAfterInsertion),
    };
}
