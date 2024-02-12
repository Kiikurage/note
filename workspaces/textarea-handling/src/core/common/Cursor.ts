import { DocNode } from './node/DocNode';
import { Position } from './Position';
import { dataclass } from '../../lib/dataclass';

export class Cursor extends dataclass<{
    anchor: Position;
    focus: Position;
}>() {
    get from() {
        return Position.compare(this.anchor, this.focus) <= 0 ? this.anchor : this.focus;
    }

    get to() {
        return Position.compare(this.anchor, this.focus) <= 0 ? this.focus : this.anchor;
    }

    get collapsed() {
        return this.anchor.node === this.focus.node && this.anchor.offset === this.focus.offset;
    }

    toString() {
        return `Cursor(${this.anchor.node.id}/${this.anchor.offset}, ${this.focus.node.id}/${this.focus.offset})`;
    }
}

export module Cursor {
    export function of(position: Position): Cursor;
    export function of(anchor: Position, focus: Position): Cursor;
    export function of(node: DocNode, offset: number): Cursor;
    export function of(node: DocNode, anchorOffset: number, focusOffset: number): Cursor;
    export function of(anchorNode: DocNode, anchorOffset: number, focusNode: DocNode, focusOffset: number): Cursor;
    export function of(...args: unknown[]): Cursor {
        switch (args.length) {
            case 1: {
                const [position] = args as [Position];
                return new Cursor({ anchor: position, focus: position });
            }
            case 2: {
                if (typeof args[1] === 'number') {
                    const [node, offset] = args as [DocNode, number];
                    return new Cursor({ anchor: Position.of(node, offset), focus: Position.of(node, offset) });
                } else {
                    const [anchor, focus] = args as [Position, Position];
                    return new Cursor({ anchor, focus });
                }
            }
            case 3: {
                const [node, anchorOffset, focusOffset] = args as [DocNode, number, number];
                return new Cursor({ anchor: Position.of(node, anchorOffset), focus: Position.of(node, focusOffset) });
            }
            case 4: {
                const [anchorNode, anchorOffset, focusNode, focusOffset] = args as [DocNode, number, DocNode, number];
                return new Cursor({
                    anchor: Position.of(anchorNode, anchorOffset),
                    focus: Position.of(focusNode, focusOffset),
                });
            }
            default:
                throw new Error('Invalid arguments');
        }
    }
}
