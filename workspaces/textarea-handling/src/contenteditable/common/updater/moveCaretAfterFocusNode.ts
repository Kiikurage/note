import { EditorState } from '../../../core/common/EditorState';
import { Cursor } from '../../../core/common/Cursor';
import { getPositionAfterNode } from './getPositionAfterNode';

export function moveCaretAfterFocusNode(state: EditorState): EditorState {
    return state.copy({ cursor: Cursor.of(getPositionAfterNode(state.root, state.cursor.focus.path)) });
}
