import { Position } from './Position';
import { Doc, NodeId } from './interfaces';
import { assert } from '../lib/assert';

export class Cursor {
    constructor(
        readonly anchor: Position,
        readonly focus: Position = anchor,
    ) {}

    static of(position: Position): Cursor;
    static of(nodeId: NodeId): Cursor;
    static of(nodeId: NodeId, offset: number): Cursor;
    static of(anchor: Position, focus: Position): Cursor;
    static of(nodeId: NodeId, fromOffset: number, toOffset: number): Cursor;
    static of(anchorNodeId: NodeId, anchorOffset: number, focusNodeId: NodeId, focusOffset: number): Cursor;
    static of(...args: unknown[]): Cursor {
        if (args.length === 1) {
            if (args[0] instanceof Position) {
                const [position] = args;
                assert(position instanceof Position, 'position instanceof Position');

                return new Cursor(position);
            } else {
                const [nodeId] = args;
                assert(typeof nodeId === 'number', 'typeof nodeId === "number"');

                return new Cursor(Position.of(nodeId));
            }
        }
        if (args.length === 2) {
            if (args[0] instanceof Position) {
                const [anchor, focus] = args;
                assert(focus instanceof Position, 'focus instanceof Position');

                return new Cursor(anchor, focus);
            } else {
                const [nodeId, offset] = args;
                assert(typeof nodeId === 'number', 'typeof nodeId === "number"');
                assert(typeof offset === 'number', 'typeof offset === "number"');

                return new Cursor(Position.of(nodeId, offset));
            }
        }
        if (args.length === 3) {
            const [nodeId, fromOffset, toOffset] = args;
            assert(typeof nodeId === 'number', 'typeof nodeId === "number"');
            assert(typeof fromOffset === 'number', 'typeof fromOffset === "number"');
            assert(typeof toOffset === 'number', 'typeof toOffset === "number"');

            return new Cursor(Position.of(nodeId, fromOffset), Position.of(nodeId, toOffset));
        }
        if (args.length === 4) {
            const [anchorNodeId, anchorOffset, focusNodeId, focusOffset] = args;
            assert(typeof anchorNodeId === 'number', 'typeof anchorNodeId === "number"');
            assert(typeof anchorOffset === 'number', 'typeof anchorOffset === "number"');
            assert(typeof focusNodeId === 'number', 'typeof focusNodeId === "number"');
            assert(typeof focusOffset === 'number', 'typeof focusOffset === "number"');

            return new Cursor(Position.of(anchorNodeId, anchorOffset), Position.of(focusNodeId, focusOffset));
        }

        throw new Error('Unsupported input');
    }

    get collapsed() {
        return this.anchor.equals(this.focus);
    }

    toString() {
        return `Cursor(${this.anchor.toString()}, ${this.focus.toString()})`;
    }

    getRange(doc: Doc): { from: Position; to: Position } {
        if (doc.compare(this.anchor, this.focus) < 0) {
            return { from: this.anchor, to: this.focus };
        } else {
            return { from: this.focus, to: this.anchor };
        }
    }
}
