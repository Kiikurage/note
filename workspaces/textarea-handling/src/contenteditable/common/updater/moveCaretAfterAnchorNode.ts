import { EditorState } from '../../../core/common/EditorState';
import { Cursor } from '../../../core/common/Cursor';
import { getPositionAfterNode } from './getPositionAfterNode';

export function moveCaretAfterAnchorNode(state: EditorState): EditorState {
    return state.copy({ cursor: Cursor.of(getPositionAfterNode(state.root, state.cursor.anchor.path)) });
}
