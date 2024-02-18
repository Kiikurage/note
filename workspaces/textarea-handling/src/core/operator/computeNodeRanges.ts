import { comparePoint, createPoint, Point } from '../Point';
import { DocNode } from '../node/DocNode';
import { assert } from '../../lib/assert';
import { TextNode } from '../node/TextNode';

interface DocNodeRange {
    node: DocNode;
    from: number;
    to: number;
    includeBegin: boolean;
    includeEnd: boolean;
}

/**
 * Collect nodes in the given range and compute sub range for each node.
 */
export function computeNodeRanges(from: Point, to: Point): DocNodeRange[] {
    const commonAncestor = DocNode.getCommonAncestor(from.node, to.node);
    assert(commonAncestor !== null, 'Common ancestor not found');

    const rangesIncludeEnd: DocNodeRange[] = [];
    let currentFrom = from;
    while (currentFrom.node !== commonAncestor) {
        const currentEnd = createPoint(currentFrom.node, currentFrom.node.length);

        rangesIncludeEnd.push({
            node: currentFrom.node,
            from: currentFrom.offset,
            to: currentEnd.offset,
            includeBegin: false,
            includeEnd: true,
        });

        const parent = currentFrom.node.parent;
        assert(parent !== null, 'Parent not found');
        currentFrom = createPoint(parent, parent.children.indexOf(currentFrom.node) + 1);
    }

    const rangesIncludeBegin: DocNodeRange[] = [];
    let currentTo = to;
    while (currentTo.node !== commonAncestor) {
        const currentFrom = createPoint(currentTo.node, 0);

        rangesIncludeBegin.unshift({
            node: currentTo.node,
            from: currentFrom.offset,
            to: currentTo.offset,
            includeBegin: true,
            includeEnd: false,
        });

        const parent = currentTo.node.parent;
        assert(parent !== null, 'Parent not found');
        currentTo = createPoint(parent, parent.children.indexOf(currentTo.node));
    }

    const rangesAtMiddle: DocNodeRange[] = [];

    if (commonAncestor instanceof TextNode) {
        rangesAtMiddle.push({
            node: commonAncestor,
            from: currentFrom.offset,
            to: currentTo.offset,
            includeBegin: false,
            includeEnd: false,
        });
    } else {
        for (const node of commonAncestor.children.slice(currentFrom.offset, currentTo.offset)) {
            rangesAtMiddle.push({
                node,
                from: 0,
                to: node.length,
                includeBegin: true,
                includeEnd: true,
            });
        }
    }

    return [...rangesIncludeEnd, ...rangesAtMiddle, ...rangesIncludeBegin];
}
