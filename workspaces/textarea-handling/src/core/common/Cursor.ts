import { dataclass } from '../../lib';
import { Path } from './Node';

export class Position extends dataclass<{ path: Path; offset: number }>() {
    static compare(a: Position, b: Position) {
        const pathCompare = a.path.compare(b.path);
        if (pathCompare !== 0) return pathCompare;

        return a.offset - b.offset;
    }

    static min(a: Position, b: Position) {
        return Position.compare(a, b) <= 0 ? a : b;
    }

    static max(a: Position, b: Position) {
        return Position.compare(a, b) >= 0 ? a : b;
    }

    static clamp(position: Position, min: Position, max: Position) {
        return Position.max(Position.min(position, max), min);
    }

    toString() {
        return `${this.path}/${this.offset}`;
    }

    valueOf() {
        return this.toString();
    }

    [Symbol.toStringTag]() {
        return this.toString();
    }

    [Symbol.toPrimitive]() {
        return this.toString();
    }
}

export class Cursor extends dataclass<{ id: string; anchor: Position; focus: Position }>() {
    get from() {
        return this.direction === 'forward' ? this.anchor : this.focus;
    }

    get to() {
        return this.direction === 'forward' ? this.focus : this.anchor;
    }

    get direction() {
        return Position.compare(this.anchor, this.focus) <= 0 ? 'forward' : 'backward';
    }

    get collapsed() {
        return Position.compare(this.anchor, this.focus) === 0;
    }

    isOverlapped(other: Cursor) {
        return Position.compare(other.from, this.to) < 0 && Position.compare(this.from, other.to) < 0;
    }

    toString() {
        return `Cursor(${this.id}, ${this.anchor.toString()}, ${this.focus.toString()})`;
    }
}
