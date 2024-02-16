import { DocNode } from './node/DocNode';

export interface Point {
    node: DocNode;
    offset: number;
}

export function createPoint(node: DocNode, offset: number): Point {
    return { node, offset };
}

export function comparePoint(p1: Point, p2: Point): number {
    if (p1.node === p2.node) return p1.offset - p2.offset;

    function computePointMap(point: Point): Map<DocNode, number> {
        const map = new Map();
        let node = point.node;
        map.set(node, point.offset);
        while (node.parent !== null) {
            map.set(node.parent, node.parent.children.indexOf(node));
            node = node.parent;
        }
        return map;
    }

    const points1 = computePointMap(p1);
    const points2 = computePointMap(p2);

    for (const [node, offset2] of points2.entries()) {
        const offset1 = points1.get(node);
        if (offset1 === undefined || offset1 === offset2) continue;
        return offset1 - offset2;
    }

    return points1.size - points2.size;
}
