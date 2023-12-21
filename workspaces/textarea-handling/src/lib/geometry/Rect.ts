import { Vector2 } from './Vector2';
import { LineSegment } from './LineSegment';
import { dataclass } from '../dataclass';

export class Rect extends dataclass<{
    top: number;
    left: number;
    width: number;
    height: number;
}>() {
    get right() {
        return this.left + this.width;
    }

    get bottom() {
        return this.top + this.height;
    }

    get topLeft() {
        return new Vector2({ y: this.top, x: this.left });
    }

    get topRight() {
        return new Vector2({ y: this.top, x: this.right });
    }

    get bottomRight() {
        return new Vector2({ y: this.bottom, x: this.right });
    }

    get bottomLeft() {
        return new Vector2({ y: this.bottom, x: this.left });
    }

    get center() {
        return new Vector2({ y: this.top + this.height / 2, x: this.left + this.width / 2 });
    }

    get size() {
        return new Vector2({ y: this.height, x: this.width });
    }

    get edges(): [l12: LineSegment, l14: LineSegment, l23: LineSegment, l43: LineSegment] {
        return [
            LineSegment.fromPoints(this.topLeft, this.topRight),
            LineSegment.fromPoints(this.topLeft, this.bottomLeft),
            LineSegment.fromPoints(this.topRight, this.bottomRight),
            LineSegment.fromPoints(this.bottomLeft, this.bottomRight),
        ];
    }
}
