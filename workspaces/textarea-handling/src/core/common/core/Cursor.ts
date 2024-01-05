import { dataclass } from '../../../lib';
import { Position } from './Position';

export class Cursor extends dataclass<{ id: string; anchor: Position; focus: Position }>() {
    get collapsed() {
        return this.anchor.equals(this.focus);
    }

    toString() {
        return `Cursor(${this.id}, ${this.anchor.toString()}, ${this.focus.toString()})`;
    }
}
