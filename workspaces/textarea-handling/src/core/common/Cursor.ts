import { assert, dataclass } from '../../lib';
import { Position } from './Position';
import { Path } from './Path';

export class Cursor {
    constructor(
        readonly anchor: Position,
        readonly focus: Position = anchor,
    ) {}

    static of(position: Position): Cursor;
    static of(path: Path): Cursor;
    static of(path: Path, offset: number): Cursor;
    static of(anchor: Position, focus: Position): Cursor;
    static of(path: Path, fromOffset: number, toOffset: number): Cursor;
    static of(anchorPath: Path, anchorOffset: number, focusPath: Path, focusOffset: number): Cursor;
    static of(...args: unknown[]): Cursor {
        if (args.length === 1) {
            if (args[0] instanceof Position) {
                const [position] = args;
                assert(position instanceof Position, 'position instanceof Position');

                return new Cursor(position);
            } else {
                const [path] = args;
                assert(path instanceof Path, 'path instanceof Path');

                return new Cursor(Position.of(path));
            }
        }
        if (args.length === 2) {
            if (args[0] instanceof Path) {
                const [path, offset] = args;
                assert(typeof offset === 'number', 'typeof offset === "number"');

                return new Cursor(Position.of(path, offset));
            } else {
                const [anchor, focus] = args;
                assert(anchor instanceof Position, 'anchor instanceof Position');
                assert(focus instanceof Position, 'focus instanceof Position');

                return new Cursor(anchor, focus);
            }
        }
        if (args.length === 3) {
            const [path, fromOffset, toOffset] = args;
            assert(path instanceof Path, 'path instanceof Path');
            assert(typeof fromOffset === 'number', 'typeof fromOffset === "number"');
            assert(typeof toOffset === 'number', 'typeof toOffset === "number"');

            return new Cursor(Position.of(path, fromOffset), Position.of(path, toOffset));
        }
        if (args.length === 3) {
            const [anchorPath, anchorOffset, focusPath, focusOffset] = args;
            assert(anchorPath instanceof Path, 'anchorPath instanceof Path');
            assert(typeof anchorOffset === 'number', 'typeof anchorOffset === "number"');
            assert(focusPath instanceof Path, 'focusPath instanceof Path');
            assert(typeof focusOffset === 'number', 'typeof focusOffset === "number"');

            return new Cursor(Position.of(anchorPath, anchorOffset), Position.of(focusPath, focusOffset));
        }

        throw new Error('Unsupported input');
    }

    get collapsed() {
        return this.anchor.equals(this.focus);
    }

    toString() {
        return `Cursor(${this.anchor.toString()}, ${this.focus.toString()})`;
    }
}
