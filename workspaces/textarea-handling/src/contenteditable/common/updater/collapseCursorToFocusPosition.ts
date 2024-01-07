import { EditorState } from '../../../core/common/EditorState';
import { Cursor } from '../../../core/common/Cursor';
import { getPositionAfterNode } from './getPositionAfterNode';

export function collapseCursorToFocusPosition(state: EditorState): EditorState {
    return state.copy({ cursor: Cursor.of(state.cursor.focus) });
}
