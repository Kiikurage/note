import { EditorState } from '../EditorState';
import { collapsed, createCursor, getCursorFrom, getCursorTo } from '../Cursor';
import { deleteContentBackward } from './deleteContentBackward';
import { comparePoint, createPoint, Point } from '../Point';
import { setCursor } from './setCursor';
import { DocNode } from '../node/DocNode';
import { cloneTreeInRange } from './cloneTreeInRange';

export function deleteSelectedRange(state: EditorState): EditorState {
    if (collapsed(state.cursor)) return state;

    const from = getCursorFrom(state.cursor);
    const to = getCursorTo(state.cursor);

    const result = deleteByRange(from, to);

    return setCursor(state, createCursor(result.point));
}

export function deleteByRange(from: Point, to: Point): { point: Point; contents: DocNode[] } {
    if (comparePoint(from, to) === 0) return { point: from, contents: [] };

    // TODO: Collect this information during deletion
    const deletedContents = cloneTreeInRange(from, to);

    let current = to;
    while (comparePoint(from, current) < 0) {
        if (current.node === from.node) {
            // Delete to the "from" point and complete the process
            return from.node.deleteContent(from.offset, current.offset);
        } else if (comparePoint(createPoint(current.node, 0), from) < 0) {
            // "from" is middle of this node. Step into child nodes and find the exact "from" point
            const child = current.node.children[current.offset - 1];
            current = createPoint(child, child.length);
        } else {
            // Normal deletion
            if (current.offset === 0) {
                current = current.node.deleteContentBackward(0).point;
            } else {
                current = current.node.deleteContent(0, current.offset).point;
            }
        }
    }

    return { point: current, contents: deletedContents };
}
