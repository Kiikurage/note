import { DocNode } from './node/DocNode';

export interface Position {
    node: DocNode;
    offset: number;
}

export module Position {
    export function of(node: DocNode, offset: number): Position {
        return { node, offset };
    }

    export function compare(p1: Position, p2: Position): number {
        if (p1.node === p2.node) return p1.offset - p2.offset;

        function computePositionMap(position: Position): Map<DocNode, number> {
            const map = new Map();
            let node = position.node;
            map.set(node, position.offset);
            while (node.parent !== null) {
                map.set(node.parent, node.parent.children.indexOf(node));
                node = node.parent;
            }
            return map;
        }

        const positions1 = computePositionMap(p1);
        const positions2 = computePositionMap(p2);

        for (const [node, offset2] of positions2.entries()) {
            const offset1 = positions1.get(node);
            if (offset1 === undefined || offset1 === offset2) continue;
            return offset1 - offset2;
        }

        return positions1.size - positions2.size;
    }
}
