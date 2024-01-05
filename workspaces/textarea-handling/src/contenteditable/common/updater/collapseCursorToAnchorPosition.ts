import { EditorState } from '../../../core/common/core/EditorState';
import { Cursor } from '../../../core/common/core/Cursor';

export function collapseCursorToAnchorPosition(state: EditorState): EditorState {
    return state.copy({ cursor: Cursor.of(state.cursor.anchor) });
}
