import { assert } from '../../../lib';
import { RootNode } from '../../../core/common/node/RootNode';
import { Logger } from '../../../lib/logger';
import { EditorState } from '../../../core/common/core/EditorState';
import { Cursor } from '../../../core/common/core/Cursor';
import { Position } from '../../../core/common/core/Position';
import { moveCaretBeforeFocusNode } from './moveCaretBeforeFocusNode';

export function joinFocusNodeToPrevious(state: EditorState) {
    const caret = state.cursor.focus;

    const node = state.root.getByPath(caret.path);
    assert(node !== null, 'node must not be null');

    if (node instanceof RootNode) return state;

    const parentPath = caret.path.parent();
    const parent = state.root.getByPath(parentPath);
    assert(parent !== null, 'parent must not be null');

    const offset = parent.children.indexOf(node);
    assert(offset !== -1, 'offset must not be -1');

    if (offset === 0) {
        const pathOfAncestorHavingSibling = state.root.findAncestor(caret.path, (node, path) => {
            if (path.isRoot) return false;
            const parent = state.root.getByPath(path.parent());
            assert(parent !== null, 'parent must not be null');

            const offset = parent.children.indexOf(node);
            return offset > 0;
        });
        if (pathOfAncestorHavingSibling === null) return state;

        return joinFocusNodeToPrevious(moveCaretBeforeFocusNode(state));
    }

    const prevNode = parent.children[offset - 1];

    return state.copy({
        root: state.root.spliceByPosition(Position.of(parentPath, offset - 1), 2, ...prevNode.join(node)),
        cursor: Cursor.of(state.root.getEndPosition(parentPath.child(prevNode.id))),
    });
}

const logger = Logger.of(joinFocusNodeToPrevious);
