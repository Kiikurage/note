import { assert, dataclass } from '../../lib';

export class Path extends dataclass<{
    offsets: number[];
}>() {
    static readonly ROOT = Path.of();

    static of(...offsets: number[]): Path {
        return new Path({ offsets });
    }

    static min(a: Path, b: Path) {
        return a.compare(b) <= 0 ? a : b;
    }

    static max(a: Path, b: Path) {
        return a.compare(b) >= 0 ? a : b;
    }

    static clamp(path: Path, min: Path, max: Path) {
        return Path.max(Path.min(path, max), min);
    }

    static parse(pathStr: string): Path {
        if (pathStr === '') return Path.ROOT;
        return Path.of(...pathStr.split('.').map((str) => +str));
    }

    get depth() {
        return this.offsets.length;
    }

    get isRoot() {
        return this.depth === 0;
    }

    join(other: Path): Path {
        return Path.of(...this.offsets, ...other.offsets);
    }

    parent(): Path {
        return Path.of(...this.offsets.slice(0, -1));
    }

    firstChild(): Path {
        return Path.of(...this.offsets, 0);
    }

    isSibling(other: Path) {
        if (this.depth !== other.depth) return false;
        if (this.depth === 0) return true;
        return this.compare(other) === 0;
    }

    equals(other: Path) {
        return this.toString() === other.toString();
    }

    compare(other: Path) {
        if (this.isRoot) return other.isRoot ? 0 : -1;
        if (other.isRoot) return this.isRoot ? 0 : 1;

        const thisStr = this.toString();
        const otherStr = other.toString();

        return thisStr < otherStr ? -1 : thisStr > otherStr ? 1 : 0;
    }

    includes(descendant: Path) {
        if (this.equals(descendant)) return true;

        return this.hasDescendant(descendant);
    }

    hasDescendant(descendant: Path) {
        if (this.depth >= descendant.depth) return false;

        for (let i = 0; i < this.depth; i++) {
            if (this.offsets[i] !== descendant.offsets[i]) return false;
        }

        return true;
    }

    nextSibling() {
        const offsets = this.offsets.slice();
        offsets[offsets.length - 1] += 1;
        return this.copy({ offsets });
    }

    prevSibling() {
        const offsets = this.offsets.slice();
        if (offsets[offsets.length - 1] === 0) return null;
        offsets[offsets.length - 1] -= 1;
        return this.copy({ offsets });
    }

    slice(start?: number, end?: number) {
        return Path.of(...this.offsets.slice(start, end));
    }

    toString() {
        return this.depth === 0 ? 'root' : this.offsets.join('.');
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

export interface Node {
    type: string;
    children: Node[];
}

export module Node {
    export function replaceNode(root: Node, path: Path, node: Node): Node {
        if (path.isRoot) return node;

        const index = path.offsets[0];
        const children = root.children.slice();
        assert(index >= 0 && index < children.length, `index ${index} is out of range [0, ${children.length})`);
        children[index] = replaceNode(children[index], path.slice(1), node);

        return { ...root, children };
    }

    export function updateNode(root: Node, path: Path, updater: (node: Node) => Node): Node {
        const node = getNode(root, path);
        if (node === null) {
            throw new Error(`Node ${path} is not found`);
        }
        return replaceNode(root, path, updater(node));
    }

    export function deleteNode(root: Node, path: Path): Node {
        assert(!path.isRoot, 'root cannot be removed');

        const index = path.offsets[0];
        assert(
            index >= 0 && index < root.children.length,
            `index ${index} is out of range [0, ${root.children.length})`,
        );
        if (path.depth > 1) return replaceNode(root, path.slice(0, 1), deleteNode(root.children[index], path.slice(1)));

        const children = root.children.slice();
        children.splice(index, 1);

        return { ...root, children };
    }

    export function deleteByRange(root: Node, from: Path, to: Path): Node {
        const paths = computeSubTreesForRange(root, from, to).sort((a, b) => b.compare(a));

        let result = root;
        for (const path of paths) {
            result = deleteNode(result, path);
        }

        return result;
    }

    export function insertNode(root: Node, path: Path, node: Node): Node {
        assert(!path.isRoot, 'cannot insert at root');

        const index = path.offsets[0];
        assert(
            index >= 0 && index <= root.children.length,
            `index ${index} is out of range [0, ${root.children.length}]`,
        );
        if (path.depth > 1)
            return replaceNode(root, path.slice(0, 1), insertNode(root.children[index], path.slice(1), node));

        const children = root.children.slice();
        children.splice(index, 0, node);

        return { ...root, children };
    }

    export function getNode(root: Node, path: Path): Node | null {
        if (path.isRoot) return root;

        const index = path.offsets[0];
        if (index < 0 || index >= root.children.length) {
            return null;
        }

        return getNode(root.children[index], path.slice(1));
    }

    /**
     * Return the path of the next to the last node.
     * e.g. When the last node's path is 1.2.3, return 1.2.4
     */
    export function last(root: Node): Path {
        const offsets: number[] = [];
        let node = root;

        while (node.children.length > 0) {
            const index = node.children.length - 1;
            offsets.push(index);
            node = node.children[index];

            if (node.children.length === 0) {
                offsets[offsets.length - 1] += 1;
                break;
            }
        }

        return Path.of(...offsets);
    }

    /**
     * Return previous position's path. If the given path is the first position, return null.
     */
    export function getPrevPath(root: Node, path: Path): Path | null {
        if (path.isRoot) return null;

        const prevPath = path.prevSibling();
        if (prevPath === null) return getPrevPath(root, path.parent());

        const prev = getNode(root, prevPath);
        assert(prev !== null, 'prev must not be null');

        return prevPath.join(last(prev));
    }

    /**
     * Return next position's path. If the given path is the last position, return null.
     */
    export function getNextPath(root: Node, path: Path): Path | null {
        if (path.isRoot) return root.children.length > 0 ? Path.of(0) : null;

        const node = getNode(root, path);
        if (node === null) return getNextPath(root, path.parent());

        if (node.children.length > 0) return Path.of(...path.offsets, 0);

        return path.nextSibling();
    }

    /**
     * Return next node's path. If the given path is the root node, return null.
     *
     * e.g.
     * - Basic case
     *      - 0 -> 1
     *      - 1.2 -> 1.3
     * - When the given path is the last child, return parent's next sibling
     *      - 1.2.3 -> 1.3 (if 1.2.4 does not exist)
     *      - 1.2.3 -> 2 (if neither 1.2.4 nor 1.3 do not exist)
     * - When the given path is root, return null
     *      - root -> null
     */
    export function getNextNodePath(root: Node, path: Path): Path | null {
        if (path.isRoot) return null;

        const next = path.nextSibling();
        if (getNode(root, next) !== null) return next;

        return getNextNodePath(root, path.parent());
    }

    /**
     * Compute the set of subtrees that make up the specified range and return the Path of their roots.
     */
    export function computeSubTreesForRange(root: Node, from: Path, to: Path): Path[] {
        const lastPath = Node.last(root);
        to = Path.clamp(to, Path.ROOT, lastPath);
        from = Path.clamp(from, Path.ROOT, lastPath);

        const result: Path[] = [];
        let path = from;

        // eslint-disable-next-line no-constant-condition
        while (!path.equals(to)) {
            const nextPath = path.nextSibling();

            const cmp = nextPath.compare(to);
            if (cmp <= 0) {
                result.push(path);
                if (cmp === 0) break;
                const actualNextPath = getNextNodePath(root, path);
                if (actualNextPath === null) break;
                path = actualNextPath;
            } else {
                path = path.firstChild();
            }
        }

        return result;
    }
}

export interface TextNode extends Node {
    type: 'text';
    value: string;
}

export module TextNode {
    export function create(): TextNode {
        return { type: 'text', children: [], value: '' };
    }

    export function isTextNode(node: Node): node is TextNode {
        return node.type === 'text';
    }

    export function setText(node: TextNode, value: string): TextNode {
        return { ...node, value };
    }
}
