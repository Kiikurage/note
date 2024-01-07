import { EditorState } from '../../../core/common/EditorState';
import { Cursor } from '../../../core/common/Cursor';

export function collapseCursorToAnchorPosition(state: EditorState): EditorState {
    return state.copy({ cursor: Cursor.of(state.cursor.anchor) });
}
