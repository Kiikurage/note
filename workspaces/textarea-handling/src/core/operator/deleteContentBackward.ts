import { collapsed, createCursor } from '../Cursor';
import { EditorState } from '../EditorState';
import { deleteSelectedRange } from './deleteSelectedRange';

export function deleteContentBackward(state: EditorState): EditorState {
    if (!collapsed(state.cursor)) return deleteSelectedRange(state);

    const result = state.cursor.focus.node.deleteContentBackward(state.cursor.focus.offset);
    return { ...state, cursor: createCursor(result.point) };
}
