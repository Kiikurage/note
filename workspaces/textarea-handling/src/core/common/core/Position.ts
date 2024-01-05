import { dataclass } from '../../../lib';
import { Path } from './Path';

export class Position extends dataclass<{ path: Path; offset: number }>() {
    static of(path: Path, offset = 0) {
        return new Position({ path, offset });
    }

    get depth() {
        return this.path.depth;
    }

    parent() {
        return Position.of(this.path.parent());
    }

    equals(other: Position) {
        return this.path.equals(other.path) && this.offset === other.offset;
    }

    toString() {
        return `${this.path}/${this.offset}`;
    }
    slice(start?: number, end?: number) {
        return this.copy({ path: this.path.slice(start, end) });
    }
}
