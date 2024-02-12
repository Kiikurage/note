import { Cursor } from '../Cursor';
import { EditorState } from '../EditorState';
import { deleteSelectedRange } from './deleteSelectedRange';
import { ParagraphNode } from '../node/ContainerNode';
import { RootNode } from '../node/RootNode';

export function insertParagraph(state: EditorState): EditorState {
    if (!state.cursor.collapsed) state = deleteSelectedRange(state);

    const result = state.cursor.focus.node.insertParagraph(state.cursor.focus.offset);
    return {
        ...state,
        cursor: Cursor.of(result.positionAfterInsertion),
    };
}
