import { EditorState } from '../../../core/common/core/EditorState';
import { Cursor } from '../../../core/common/core/Cursor';
import { getPositionAfterNode } from './getPositionAfterNode';

export function collapseCursorToFocusPosition(state: EditorState): EditorState {
    return state.copy({ cursor: Cursor.of(state.cursor.focus) });
}
