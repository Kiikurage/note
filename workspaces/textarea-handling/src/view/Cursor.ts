import { dataclass } from '../lib';

export class Cursor extends dataclass<{ id: string; anchor: number; focus: number }>() {
    get from() {
        return this.direction === 'forward' ? this.anchor : this.focus;
    }

    get to() {
        return this.direction === 'forward' ? this.focus : this.anchor;
    }

    get direction() {
        return this.anchor <= this.focus ? 'forward' : 'backward';
    }

    get size() {
        return Math.abs(this.focus - this.anchor);
    }
}
