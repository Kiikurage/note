import { Vector2 } from './Vector2';
import { Rect } from './Rect';
import { LineSegment } from './LineSegment';
import { dataclass } from '../dataclass';
import { isNotNullish } from '../isNotNullish';

// ax + by + c = 0
export class Line extends dataclass<{ a: number; b: number; c: number }>() {
    getX(y: number) {
        return -(this.c + this.b * y) / this.a;
    }

    getY(x: number) {
        return -(this.c + this.a * x) / this.b;
    }

    static fromPoints(p1: Vector2, p2: Vector2) {
        const { x: x1, y: y1 } = p1;
        const { x: x2, y: y2 } = p2;

        return new Line({ a: x2 - x1, b: y1 - y2, c: x1 * y2 - x2 * y1 });
    }
}

export function getIntersectionPointForLineAndLine(line1: Line, line2: Line): Vector2 | null {
    const { a: a1, b: b1, c: c1 } = line1;
    const { a: a2, b: b2, c: c2 } = line2;

    const denominator = a1 * b2 - a2 * b1;
    if (denominator === 0) return null;

    return new Vector2({
        x: (a2 * c1 - a1 * c2) / denominator,
        y: (b1 * c2 - b2 * c1) / denominator,
    });
}

export function getIntersectionPointForLineSegmentAndRect(lineSegment1: LineSegment, rect: Rect): Vector2[] {
    return rect.edges
        .map((lineSegment2) => getIntersectionPointForLineSegmentAndLineSegment(lineSegment1, lineSegment2))
        .filter(isNotNullish);
}

export function getIntersectionPointForLineSegmentAndLineSegment(
    lineSegment1: LineSegment,
    lineSegment2: LineSegment,
): Vector2 | null {
    if (lineSegment1.length === 0 || lineSegment2.length === 0) return null;

    const line1 = Line.fromPoints(lineSegment1.p1, lineSegment1.p2);
    const line2 = Line.fromPoints(lineSegment2.p1, lineSegment2.p2);

    const point = getIntersectionPointForLineAndLine(line1, line2);
    if (point === null) return null;

    if (point.x < Math.min(lineSegment1.p1.x, lineSegment1.p2.x)) return null;
    if (point.x > Math.max(lineSegment1.p1.x, lineSegment1.p2.x)) return null;
    if (point.y < Math.min(lineSegment1.p1.y, lineSegment1.p2.y)) return null;
    if (point.y > Math.max(lineSegment1.p1.y, lineSegment1.p2.y)) return null;

    if (point.x < Math.min(lineSegment2.p1.x, lineSegment2.p2.x)) return null;
    if (point.x > Math.max(lineSegment2.p1.x, lineSegment2.p2.x)) return null;
    if (point.y < Math.min(lineSegment2.p1.y, lineSegment2.p2.y)) return null;
    if (point.y > Math.max(lineSegment2.p1.y, lineSegment2.p2.y)) return null;

    return point;
}
