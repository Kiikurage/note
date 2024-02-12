import { Cursor } from '../Cursor';
import { EditorState } from '../EditorState';
import { deleteSelectedRange } from './deleteSelectedRange';

export function insertText(state: EditorState, text: string): EditorState {
    if (!state.cursor.collapsed) state = deleteSelectedRange(state);

    const result = state.cursor.focus.node.insertText(state.cursor.focus.offset, text);
    return {
        ...state,
        cursor: Cursor.of(result.positionAfterInsertion),
    };
}
