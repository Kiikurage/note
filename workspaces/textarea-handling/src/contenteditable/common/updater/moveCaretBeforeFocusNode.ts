import { EditorState } from '../../../core/common/core/EditorState';
import { Cursor } from '../../../core/common/core/Cursor';
import { getPositionBeforeNode } from './getPositionBeforeNode';

export function moveCaretBeforeFocusNode(state: EditorState): EditorState {
    return state.copy({ cursor: Cursor.of(getPositionBeforeNode(state.root, state.cursor.focus.path)) });
}
