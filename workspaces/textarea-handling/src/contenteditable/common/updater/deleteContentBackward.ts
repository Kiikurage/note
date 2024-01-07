import { assert } from '../../../lib';
import { TextNode } from '../../../core/common/TextNode';
import { RootNode } from '../../../core/common/RootNode';
import { Logger } from '../../../lib/logger';
import { EditorState } from '../../../core/common/EditorState';
import { Cursor } from '../../../core/common/Cursor';
import { joinFocusNodeToPrevious } from './joinFocusNodeToPrevious';
import { deleteSelectedRange } from './deleteSelectedRange';

export function deleteContentBackward(state: EditorState) {
    if (!state.cursor.collapsed) return deleteSelectedRange(state);

    const caret = state.cursor.focus;

    const node = state.root.getByPath(caret.path);
    assert(node !== null, 'node must not be null');

    if (caret.offset === 0) {
        if (node instanceof RootNode) return state;

        return joinFocusNodeToPrevious(state);
    } else {
        if (node instanceof TextNode && node.length === 1) {
            const path = caret.path.parent();
            const parent = state.root.getByPath(path);
            assert(parent !== null, 'parent must not be null');

            const offset = parent.children?.indexOf(node);
            assert(offset !== -1, 'offset must not be -1');

            return state.copy({
                root: state.root.deleteByPath(caret.path),
                cursor: Cursor.of(path, offset),
            });
        }

        return state.copy({
            root: state.root.deleteByPosition(caret.copy({ offset: caret.offset - 1 })),
            cursor: Cursor.of(caret.path, caret.offset - 1),
        });
    }
}

const logger = Logger.of(deleteContentBackward);
