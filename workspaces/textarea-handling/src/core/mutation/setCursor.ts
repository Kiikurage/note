import { Cursor } from '../Cursor';
import { EditorState } from '../EditorState';

export function setCursor(state: EditorState, cursor: Cursor): EditorState {
    return { ...state, cursor };
}
