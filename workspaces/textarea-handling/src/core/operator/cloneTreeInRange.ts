import { Point } from '../Point';
import { DocNode } from '../node/DocNode';
import { computeNodeRanges } from './computeNodeRanges';

/**
 * Clone the given range of tree
 */
export function cloneTreeInRange(from: Point, to: Point): DocNode[] {
    const ranges = computeNodeRanges(from, to);

    const rangesByNode = new Map<DocNode, { from: number; to: number }>();
    for (const { node, from, to } of ranges) {
        rangesByNode.set(node, { from, to });
    }
    for (const { node, from, to } of ranges) {
        let length = to - from;
        if (node.isContainer()) {
            if (rangesByNode.has(node.children[to])) length++;
            if (rangesByNode.has(node.children[from - 1])) length++;
        }
        if (!node.mayBeEmpty() && length === 0) {
            rangesByNode.delete(node);
        }
    }

    const cache = new Map<DocNode, DocNode>();
    const result: DocNode[] = [];
    for (const { node, from, to } of ranges) {
        const clone = node.cloneTree(cache);

        if (node.isContainer()) {
            // children[to] and children[from-1] need to be cloned only if they are also in range.
            if (to < node.children.length) {
                clone.deleteContent(to + 1, clone.length);
                if (!rangesByNode.has(node.children[to])) clone.deleteContent(to, to + 1);
            }
            if (0 <= from - 1) {
                if (!rangesByNode.has(node.children[from - 1])) clone.deleteContent(from - 1, from);
                clone.deleteContent(0, from - 1);
            }
        } else {
            clone.deleteContent(to, clone.length);
            clone.deleteContent(0, from);
        }

        if (node.parent === null || !rangesByNode.has(node.parent)) {
            // This node is a top-level node for the range.
            result.push(clone);
        }
    }

    return result;
}
