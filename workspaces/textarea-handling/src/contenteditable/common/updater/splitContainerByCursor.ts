import { assert, isNotNullish } from '../../../lib';
import { ParagraphNode } from '../../../core/common/ParagraphNode';
import { Logger } from '../../../lib/logger';
import { Cursor } from '../../../core/common/Cursor';
import { EditorState } from '../../../core/common/EditorState';
import { Position } from '../../../core/common/Position';
import { Path } from '../../../core/common/Path';

/**
 * Split specified node by cursor and move cursor to new node.
 * @param state old editor state
 * @param path path of node to split. Must be an ancestor of focus node.
 * @param newCursor new cursor position after split. 'before' or 'after'.
 */
export function splitNodeByCursor(state: EditorState, path: Path, newCursor: 'before' | 'after' = 'after') {
    assert(state.cursor.collapsed, 'state.cursor.collapsed must be true');

    const caret = state.cursor.focus;
    assert(path.includes(caret.path), 'path.includes(caret.path)');

    const node = state.root.getByPath(path);
    assert(node != null, 'node != null');

    const parentPath = path.parent();
    const parent = state.root.getByPath(parentPath);
    assert(parent != null, 'parent != null');

    const offset = parent.children.findIndex((child) => child.id === node.id);
    assert(offset !== -1, 'offset !== -1');

    const relativeChildPosition = caret.slice(path.depth);

    const splitResult = node.splitByPosition(relativeChildPosition).filter(isNotNullish);
    if (splitResult[0] === node && splitResult[1] === null) return state;
    if (splitResult[0] === null && splitResult[1] === node) return state;
    if (splitResult[0] === null && splitResult[1] === null) {
        return state.copy({
            root: state.root.spliceByPosition(Position.of(parentPath, offset), 1),
        });
    }

    let cursor: Cursor;
    if (newCursor === 'before' && splitResult[0] !== null) {
        const nodeIds = parentPath.nodeIds.slice();
        let focusNode = splitResult[0];
        for (let i = 0; i < path.depth - parentPath.depth; i++) {
            nodeIds.push(focusNode.id);
            if (focusNode.children.length === 0) break;
            focusNode = focusNode.children[focusNode.children.length - 1];
        }
        cursor = Cursor.of(Path.of(...nodeIds), focusNode.length);
    } else {
        const nodeIds = parentPath.nodeIds.slice();
        let focusNode = splitResult[1];
        for (let i = 0; i < path.depth - parentPath.depth; i++) {
            nodeIds.push(focusNode.id);
            if (focusNode.children.length === 0) break;
            focusNode = focusNode.children[0];
        }
        cursor = Cursor.of(Path.of(...nodeIds), 0);
    }
    return state.copy({
        root: state.root.spliceByPosition(Position.of(parentPath, offset), 1, ...splitResult.filter(isNotNullish)),
        cursor,
    });
}

const logger = Logger.of(splitNodeByCursor);
