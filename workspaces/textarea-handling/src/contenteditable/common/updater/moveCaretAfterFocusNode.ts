import { EditorState } from '../../../core/common/core/EditorState';
import { Cursor } from '../../../core/common/core/Cursor';
import { getPositionAfterNode } from './getPositionAfterNode';

export function moveCaretAfterFocusNode(state: EditorState): EditorState {
    return state.copy({ cursor: Cursor.of(getPositionAfterNode(state.root, state.cursor.focus.path)) });
}
