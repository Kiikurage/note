import { Cursor } from '../Cursor';
import { EditorState } from '../EditorState';
import { deleteSelectedRange } from './deleteSelectedRange';

export function deleteContentBackward(state: EditorState): EditorState {
    if (!state.cursor.collapsed) return deleteSelectedRange(state);

    const result = state.cursor.focus.node.deleteContentBackward(state.cursor.focus.offset);
    return {
        ...state,
        cursor: Cursor.of(result.positionAfterDeletion),
    };
}
