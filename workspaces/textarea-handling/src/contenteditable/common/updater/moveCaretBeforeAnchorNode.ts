import { EditorState } from '../../../core/common/EditorState';
import { Cursor } from '../../../core/common/Cursor';
import { getPositionBeforeNode } from './getPositionBeforeNode';

export function moveCaretBeforeAnchorNode(state: EditorState): EditorState {
    return state.copy({ cursor: Cursor.of(getPositionBeforeNode(state.root, state.cursor.anchor.path)) });
}
