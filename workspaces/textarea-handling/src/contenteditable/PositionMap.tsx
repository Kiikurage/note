import { Position } from '../core/Position';
import { DIContainer } from '../lib/DIContainer';

export interface PositionInDOM {
    node: Node;
    offset: number;
}

export class PositionMap {
    private readonly map = new Map<Node, Position>();
    static readonly ServiceKey = DIContainer.register(() => new PositionMap());

    register(node: Node, position: Position) {
        this.map.set(node, position);
    }

    unregister(node: Node) {
        this.map.delete(node);
    }

    getPositionInDOM(positionInModel: Position): PositionInDOM | null {
        let best: PositionInDOM | null = null;
        for (const [node, { nodeId, offset }] of this.map) {
            if (nodeId !== positionInModel.nodeId) continue;
            if (offset > positionInModel.offset) continue;
            if (best === null || best.offset < offset) {
                best = { node, offset };
            }
        }

        if (best === null) return null;

        return { node: best.node, offset: positionInModel.offset - best.offset };
    }

    getPositionInModel(node: Node, offset: number): Position | null {
        let best: Position | null = null;
        for (const entry of this.map) {
            if (entry[0] !== node) continue;
            if (entry[1].offset > offset) continue;
            if (best === null || best.offset < entry[1].offset) {
                best = entry[1];
            }
        }

        if (best === null) return null;

        return Position.of(best.nodeId, best.offset + offset);
    }
}
