import { EditorState } from '../core/common/core/EditorState';
import { assert, isNotNullish } from '../lib';
import { LinkNode } from './LinkNode';
import { Position } from '../core/common/core/Position';
import { Logger } from '../lib/logger';
import { Cursor } from '../core/common/core/Cursor';

export function insertLinkToSelection(state: EditorState) {
    if (state.cursor.collapsed) return state;
    const { focus, anchor } = state.cursor;
    assert(focus.path.equals(anchor.path), 'focus.path.equals(anchor.path)');

    const path = focus.path;
    const fromOffset = Math.min(focus.offset, anchor.offset);
    const toOffset = Math.max(focus.offset, anchor.offset);

    const node = state.root.getByPath(path);
    assert(node != null, 'node != null');

    const [leftAndMid, right] = node.split(toOffset);
    assert(leftAndMid !== null, 'leftAndMid !== null');
    const [left, mid] = leftAndMid.split(fromOffset);
    assert(mid !== null, 'mid !== null');

    const link = new LinkNode({ href: 'https://example.com' }, [mid]);

    const parentPath = path.parent();
    const parent = state.root.getByPath(parentPath);
    assert(parent != null, 'parent != null');

    const offset = parent.children.findIndex((child) => child.id === node.id);
    assert(offset !== -1, 'offset !== -1');

    return state.copy({
        root: state.root.spliceByPosition(
            Position.of(parentPath, offset),
            1,
            ...[left, link, right].filter(isNotNullish),
        ),
        cursor: Cursor.of(parentPath.child(link.id), 0, 1),
    });
}

const logger = Logger.of(insertLinkToSelection);
