import { assert, dataclass } from '../../../lib';

export class Path extends dataclass<{
    nodeIds: number[];
}>() {
    static of(...nodeIds: number[]): Path {
        return new Path({ nodeIds });
    }

    static parse(pathStr: string): Path {
        return Path.of(...pathStr.split('.').map((str) => +str));
    }

    get depth() {
        return this.nodeIds.length;
    }

    get isRoot() {
        return this.depth === 0;
    }

    parent(): Path {
        assert(!this.isRoot, 'root does not have parent');
        return Path.of(...this.nodeIds.slice(0, -1));
    }

    child(childId: number): Path {
        return Path.of(...this.nodeIds, childId);
    }

    isSibling(other: Path) {
        if (this.depth !== other.depth) return false;
        if (this.depth === 0) return true;
        return this.parent().equals(other.parent());
    }

    equals(other: Path) {
        return this.toString() === other.toString();
    }

    includes(descendant: Path) {
        if (this.equals(descendant)) return true;

        return this.hasDescendant(descendant);
    }

    hasDescendant(descendant: Path) {
        if (this.depth >= descendant.depth) return false;

        for (let i = 0; i < this.depth; i++) {
            if (this.nodeIds[i] !== descendant.nodeIds[i]) return false;
        }

        return true;
    }

    slice(start?: number, end?: number) {
        return Path.of(...this.nodeIds.slice(start, end));
    }

    toString() {
        return this.depth === 0 ? 'root' : this.nodeIds.join('.');
    }
}
