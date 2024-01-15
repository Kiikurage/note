import { NodeId } from './interfaces';
import { assert } from '../lib/assert';
import { dataclass } from '../lib/dataclass';

export class Position extends dataclass<{ nodeId: NodeId; offset: number }>() {
    static of(nodeId: NodeId, offset = 0) {
        return new Position({ nodeId, offset });
    }

    equals(other: Position) {
        return this.nodeId === other.nodeId && this.offset === other.offset;
    }

    prev(size = 1) {
        assert(this.offset >= size, 'this.offset >= size');
        return Position.of(this.nodeId, this.offset - size);
    }

    next(size = 1) {
        return Position.of(this.nodeId, this.offset + size);
    }

    toString() {
        return `(${this.nodeId},${this.offset})`;
    }
}
