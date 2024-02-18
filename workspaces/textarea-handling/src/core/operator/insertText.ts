import { collapsed, createCursor } from '../Cursor';
import { EditorState } from '../EditorState';
import { deleteSelectedRange } from './deleteSelectedRange';

export function insertText(state: EditorState, text: string): EditorState {
    if (!collapsed(state.cursor)) state = deleteSelectedRange(state);

    const result = state.cursor.focus.node.insertText(state.cursor.focus.offset, text);
    return {
        ...state,
        cursor: createCursor(result.pointAfterInsertion),
    };
}
