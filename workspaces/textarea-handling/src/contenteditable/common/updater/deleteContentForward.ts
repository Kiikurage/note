import { EditorState } from '../../../core/common/core/EditorState';
import { assert } from '../../../lib';
import { RootNode } from '../../../core/common/node/RootNode';
import { TextNode } from '../../../core/common/node/TextNode';
import { Cursor } from '../../../core/common/core/Cursor';
import { Logger } from '../../../lib/logger';
import { deleteSelectedRange } from './deleteSelectedRange';

export function deleteContentForward(state: EditorState) {
    if (!state.cursor.collapsed) return deleteSelectedRange(state);

    const caret = state.cursor.focus;

    const node = state.root.getByPath(caret.path);
    assert(node !== null, 'node must not be null');

    if (caret.offset === node.length) {
        if (node instanceof RootNode) return state;

        logger.undefined('DeleteContentForward at the last of Node');
        return state;
    } else {
        if (node instanceof TextNode && node.length === 1) {
            const path = state.cursor.anchor.path.parent();
            const parent = state.root.getByPath(path);
            assert(parent !== null, 'parent must not be null');

            const offset = parent.children?.indexOf(node);
            assert(offset !== -1, 'offset must not be -1');

            return state.copy({
                root: state.root.deleteByPath(state.cursor.anchor.path),
                cursor: Cursor.of(path, offset),
            });
        }

        return state.copy({ root: state.root.deleteByPosition(caret) });
    }
}

const logger = Logger.of(deleteContentForward);
