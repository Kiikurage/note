import { Logger } from '../../../lib/logger';
import { EditorState } from '../../../core/common/EditorState';
import { assert } from '../../../lib';
import { Cursor } from '../../../core/common/Cursor';
import { Position } from '../../../core/common/Position';

export function deleteSelectedRange(state: EditorState) {
    const { anchor, focus } = state.cursor;
    const anchorNodeOffset =
        state.root
            .getByPath(anchor.path.parent())
            ?.children?.findIndex((node) => node.id === anchor.path.nodeIds[anchor.path.depth - 1]) ?? -1;
    assert(anchorNodeOffset !== -1, 'anchorNodeOffset must not be -1');

    if (anchor.path.equals(focus.path)) {
        const path = anchor.path;
        const node = state.root.getByPath(anchor.path);
        assert(node !== null, 'node must not be null');

        const from = Math.min(anchor.offset, focus.offset);
        const to = Math.max(anchor.offset, focus.offset);

        return state.copy({
            root: state.root.spliceByPosition(Position.of(path, from), to - from),
            cursor: Cursor.of(path, Math.min(anchor.offset, focus.offset)),
        });
    }

    const { rightCoveredPath, fullyCoveredPaths, leftCoveredPath } = state.root.computeCoveredNodes(anchor, focus);

    logger.log(rightCoveredPath, fullyCoveredPaths, leftCoveredPath);

    fullyCoveredPaths.forEach((path) => {
        state = state.copy({ root: state.root.deleteByPath(path) });
    });

    const anchorNode = state.root.getByPath(anchor.path);
    if (anchorNode !== null) {
        state = state.copy({
            root: state.root.spliceByPosition(state.cursor.anchor, anchorNode.length - state.cursor.anchor.offset),
        });
    }
    const focusNode = state.root.getByPath(focus.path);
    if (focusNode) {
        state = state.copy({
            root: state.root.spliceByPosition(Position.of(state.cursor.focus.path, 0), state.cursor.focus.offset),
        });
    }

    if (leftCoveredPath !== null) {
        const path = leftCoveredPath.slice(0, 1); // TODO
        const node = state.root.getByPath(path);
        assert(node !== null, 'node must not be null');

        const parentPath = path.parent();
        const parent = state.root.getByPath(parentPath);
        assert(parent !== null, 'parent must not be null');

        const offset = parent.children.indexOf(node);
        assert(offset !== -1, 'offset must not be -1');

        const sibling = parent.children[offset - 1];

        const result = sibling.join(node);
        if (result.length === 2) return state;

        state = state.copy({
            root: state.root.spliceByPosition(Position.of(parentPath, offset - 1), 2, ...result),
        });
    }

    if (state.root.getByPath(anchor.path) === null) {
        return state.copy({ cursor: Cursor.of(anchor.path.parent(), anchorNodeOffset) });
    } else {
        return state.copy({ cursor: Cursor.of(anchor) });
    }
}

const logger = Logger.of(deleteSelectedRange);
