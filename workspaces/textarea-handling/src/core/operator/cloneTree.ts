import { Point } from '../Point';
import { DocNode } from '../node/DocNode';
import { computeNodeRanges } from './computeNodeRanges';
import { TextNode } from '../node/TextNode';
import { Logger } from '../../lib/logger';
import { ContainerNode } from '../node/ContainerNode';

/**
 * Clone the given node and its descendants
 */
export function cloneTree(node: DocNode): DocNode;
/**
 * Clone the given range of tree
 */
export function cloneTree(from: Point, to: Point): DocNode[];
export function cloneTree(...args: unknown[]): unknown {
    if (args.length === 1) {
        const [node] = args;
        return getOrCreateClone(node as DocNode);
    }
    if (args.length === 2) {
        const [from, to] = args;
        return cloneTreeInRange(from as Point, to as Point);
    }
}

function getOrCreateClone(node: DocNode, cache?: Map<DocNode, DocNode>): DocNode {
    let clone = cache?.get(node);
    if (clone === undefined) {
        clone = node.clone();
        cache?.set(node, clone);
        for (const child of node.children) {
            clone.insertLast(getOrCreateClone(child, cache));
        }
    }
    return clone;
}

function cloneTreeInRange(from: Point, to: Point): DocNode[] {
    const ranges = computeNodeRanges(from, to);

    const rangesByNode = new Map<DocNode, { from: number; to: number }>();
    for (const { node, from, to } of ranges) {
        rangesByNode.set(node, { from, to });
    }
    for (const { node, from, to } of ranges) {
        let length = to - from;
        if (node instanceof ContainerNode) {
            if (rangesByNode.has(node.children[to])) length++;
            if (rangesByNode.has(node.children[from - 1])) length++;
        }
        if (!node.canBeEmpty() && length === 0) {
            rangesByNode.delete(node);
        }
    }

    const cache = new Map<DocNode, DocNode>();
    const result: DocNode[] = [];
    for (const { node, from, to } of ranges) {
        const clone = getOrCreateClone(node, cache);

        if (node instanceof TextNode) {
            clone.deleteContent(to, clone.length);
            clone.deleteContent(0, from);
        } else {
            // children[to] and children[from-1] need to be cloned only if they are also in range.
            if (to < node.children.length) {
                clone.deleteContent(to + 1, clone.length);
                if (!rangesByNode.has(node.children[to])) clone.deleteContent(to, to + 1);
            }
            if (0 <= from - 1) {
                if (!rangesByNode.has(node.children[from - 1])) clone.deleteContent(from - 1, from);
                clone.deleteContent(0, from - 1);
            }
        }

        if (node.parent === null || !rangesByNode.has(node.parent)) {
            // This node is a top-level node for the range.
            result.push(clone);
        }
    }

    return result;
}
