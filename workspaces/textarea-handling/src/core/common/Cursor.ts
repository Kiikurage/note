import { DocNode } from './node/DocNode';
import { comparePoint, createPoint, Point } from './Point';
import { dataclass } from '../../lib/dataclass';

export class Cursor extends dataclass<{
    anchor: Point;
    focus: Point;
}>() {
    get from() {
        return comparePoint(this.anchor, this.focus) <= 0 ? this.anchor : this.focus;
    }

    get to() {
        return comparePoint(this.anchor, this.focus) <= 0 ? this.focus : this.anchor;
    }

    get collapsed() {
        return this.anchor.node === this.focus.node && this.anchor.offset === this.focus.offset;
    }

    toString() {
        return `Cursor(${this.anchor.node.id}/${this.anchor.offset}, ${this.focus.node.id}/${this.focus.offset})`;
    }
}

export function createCursor(point: Point): Cursor;
export function createCursor(anchor: Point, focus: Point): Cursor;
export function createCursor(node: DocNode, offset: number): Cursor;
export function createCursor(node: DocNode, anchorOffset: number, focusOffset: number): Cursor;
export function createCursor(
    anchorNode: DocNode,
    anchorOffset: number,
    focusNode: DocNode,
    focusOffset: number,
): Cursor;
export function createCursor(...args: unknown[]): Cursor {
    switch (args.length) {
        case 1: {
            const [point] = args as [Point];
            return new Cursor({ anchor: point, focus: point });
        }
        case 2: {
            if (typeof args[1] === 'number') {
                const [node, offset] = args as [DocNode, number];
                return new Cursor({ anchor: createPoint(node, offset), focus: createPoint(node, offset) });
            } else {
                const [anchor, focus] = args as [Point, Point];
                return new Cursor({ anchor, focus });
            }
        }
        case 3: {
            const [node, anchorOffset, focusOffset] = args as [DocNode, number, number];
            return new Cursor({ anchor: createPoint(node, anchorOffset), focus: createPoint(node, focusOffset) });
        }
        case 4: {
            const [anchorNode, anchorOffset, focusNode, focusOffset] = args as [DocNode, number, DocNode, number];
            return new Cursor({
                anchor: createPoint(anchorNode, anchorOffset),
                focus: createPoint(focusNode, focusOffset),
            });
        }
        default:
            throw new Error('Invalid arguments');
    }
}
