import { Cursor } from '../Cursor';
import { EditorState } from '../EditorState';
import { deleteSelectedRange } from './deleteSelectedRange';

export function setCursor(state: EditorState, cursor: Cursor): EditorState {
    return { ...state, cursor };
}
