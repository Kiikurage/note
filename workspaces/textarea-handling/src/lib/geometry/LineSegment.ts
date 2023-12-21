import { dataclass } from '../dataclass';
import { Vector2 } from './Vector2';

export class LineSegment extends dataclass<{
    p1: Vector2;
    p2: Vector2;
}>() {
    get length() {
        return ((this.p1.x - this.p2.x) ** 2 + (this.p1.y - this.p2.y) ** 2) ** (1 / 2);
    }

    static fromPoints(p1: Vector2, p2: Vector2) {
        return new LineSegment({ p1, p2 });
    }
}
