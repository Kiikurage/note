import { Logger } from '../../../lib/logger';
import { EditorState } from '../../../core/common/core/EditorState';
import { assert } from '../../../lib';
import { Cursor } from '../../../core/common/core/Cursor';
import { Position } from '../../../core/common/core/Position';
import { enablePerformanceIfNeeded } from 'fork-ts-checker-webpack-plugin/lib/typescript/worker/lib/performance';
import { Path } from '../../../core/common/core/Path';

export function deleteSelectedRange(state: EditorState) {
    const { anchor, focus } = state.cursor;

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

    fullyCoveredPaths.forEach((path) => {
        state = state.copy({ root: state.root.deleteByPath(path) });
    });

    if (leftCoveredPath !== null) {
        let path = Path.of();

        for (let i = 0; i < leftCoveredPath.depth; i++) {
            path = path.child(leftCoveredPath.nodeIds[i]);
            const node = state.root.getByPath(path);
            assert(node !== null, 'node must not be null');

            const parentPath = path.parent();
            const parent = state.root.getByPath(parentPath);
            assert(parent !== null, 'parent must not be null');

            const offset = parent.children.indexOf(node);
            assert(offset !== -1, 'offset must not be -1');

            const sibling = parent.children[offset - 1];
            logger.info(path, node, sibling);

            if (i === leftCoveredPath.depth - 1) {
                const left = sibling.splice(state.cursor.anchor.offset, sibling.length - state.cursor.anchor.offset);
                const right = node.splice(0, state.cursor.focus.offset);
                state = state.copy({
                    root: state.root.spliceByPosition(Position.of(parentPath, offset - 1), 2, ...left.join(right)),
                });
            } else {
                const result = sibling.join(node);
                if (result.length === 2) return state;

                logger.log('join result', result);
                state = state.copy({
                    root: state.root.spliceByPosition(Position.of(parentPath, offset - 1), 2, ...result),
                });
                logger.log('state', state);

                path = path.parent().child(sibling.id);
            }
        }
    }

    return state.copy({
        cursor: Cursor.of(anchor),
    });
}

const logger = Logger.of(deleteSelectedRange);
