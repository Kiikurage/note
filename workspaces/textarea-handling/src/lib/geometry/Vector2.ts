import { dataclass } from '../dataclass';

export class Vector2 extends dataclass<{
    x: number;
    y: number;
}>() {
    static readonly EMPTY = new Vector2({ x: 0, y: 0 });
}
