import { DocNode } from './node/DocNode';
import { comparePoint, createPoint, dumpPoint, Point } from './Point';

export interface Cursor {
    anchor: Point;
    focus: Point;
}

export function collapsed(cursor: Cursor) {
    return cursor.anchor.node === cursor.focus.node && cursor.anchor.offset === cursor.focus.offset;
}

export function getCursorFrom(cursor: Cursor) {
    return comparePoint(cursor.anchor, cursor.focus) <= 0 ? cursor.anchor : cursor.focus;
}

export function getCursorTo(cursor: Cursor) {
    return comparePoint(cursor.anchor, cursor.focus) <= 0 ? cursor.focus : cursor.anchor;
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
            return { anchor: point, focus: point };
        }
        case 2: {
            if (typeof args[1] === 'number') {
                const [node, offset] = args as [DocNode, number];
                return createCursor(createPoint(node, offset), createPoint(node, offset));
            } else {
                const [anchor, focus] = args as [Point, Point];
                return { anchor, focus };
            }
        }
        case 3: {
            const [node, anchorOffset, focusOffset] = args as [DocNode, number, number];
            return createCursor(createPoint(node, anchorOffset), createPoint(node, focusOffset));
        }
        case 4: {
            const [anchorNode, anchorOffset, focusNode, focusOffset] = args as [DocNode, number, DocNode, number];
            return createCursor(createPoint(anchorNode, anchorOffset), createPoint(focusNode, focusOffset));
        }
        default:
            throw new Error('Invalid arguments');
    }
}

export function dumpCursor(cursor: Cursor) {
    return {
        anchor: dumpPoint(cursor.anchor),
        focus: dumpPoint(cursor.focus),
    };
}
