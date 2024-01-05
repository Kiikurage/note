import { Logger } from '../../../lib/logger';
import { assert } from '../../../lib';
import { Path } from './Path';
import { Position } from './Position';

export class Node<Props extends Record<string, unknown> = Record<string, unknown>> {
    static readonly generateId = (() => {
        let id = 0;
        return () => id++;
    })();
    readonly isContainer: boolean = true;

    constructor(
        readonly props: Props,
        readonly children: readonly Node[] = [],
        readonly id = Node.generateId(),
    ) {}

    get type() {
        if ('displayName' in this.constructor && typeof this.constructor.displayName === 'string') {
            return this.constructor.displayName;
        }

        return this.constructor.name;
    }

    get length() {
        return this.children.length;
    }

    copy(props: Partial<Props>, children: readonly Node[] = [], id = this.id): this {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new (this as any).constructor({ ...this.props, ...props }, children, id);
    }

    get(nodeId: number): Node | null {
        return this.children.find((child) => child.id === nodeId) ?? null;
    }

    getByPath(path: Path): Node | null {
        if (path.depth === 0) return this;

        return this.get(path.nodeIds[0])?.getByPath(path.slice(1)) ?? null;
    }

    replace(nodeId: number, node: Node): Node {
        const children = this.children.slice();
        const offset = children.findIndex((child) => child.id === nodeId);
        if (offset === -1) return this;
        children[offset] = node;

        return this.copy({}, children);
    }

    replaceByPath(path: Path, node: Node): Node {
        if (path.depth === 0) return node;

        const oldChild = this.get(path.nodeIds[0]);
        if (oldChild === null) return this;

        const newChild = oldChild.replaceByPath(path.slice(1), node);
        if (newChild === oldChild) return this;

        return this.replace(path.nodeIds[0], newChild);
    }

    update(nodeId: number, updater: (node: Node) => Node): Node {
        const node = this.get(nodeId);
        if (node === null) return this;

        return this.replace(nodeId, updater(node));
    }

    updateByPath(path: Path, updater: (node: Node) => Node): Node {
        if (path.depth === 0) return updater(this);

        const oldChild = this.get(path.nodeIds[0]);
        if (oldChild === null) return this;

        const newChild = oldChild.updateByPath(path.slice(1), updater);
        if (newChild === oldChild) return this;

        return this.replace(path.nodeIds[0], newChild);
    }

    splice(start: number, deleteCount: number, ...nodes: Node[]): Node {
        const children = this.children.slice();
        children.splice(start, deleteCount, ...nodes);
        return this.copy({}, children);
    }

    spliceByPosition(start: Position, deleteCount: number, ...nodes: Node[]): Node {
        return this.updateByPath(start.path, (node) => node.splice(start.offset, deleteCount, ...nodes));
    }

    delete(nodeId: number): Node {
        const children = this.children.slice();
        const offset = children.findIndex((child) => child.id === nodeId);
        if (offset === -1) return this;
        children.splice(offset, 1);

        return this.copy({}, children);
    }

    deleteByOffset(offset: number): Node {
        if (offset < 0 || offset >= this.length) return this;

        return this.delete(this.children[offset].id);
    }

    deleteByPath(path: Path): Node {
        assert(path.depth > 0, 'path.depth > 0');
        if (path.depth === 1) return this.delete(path.nodeIds[0]);

        const oldChild = this.get(path.nodeIds[0]);
        if (oldChild === null) return this;

        const newChild = oldChild.deleteByPath(path.slice(1));
        if (newChild === oldChild) return this;

        return this.replace(path.nodeIds[0], newChild);
    }

    deleteByPosition(position: Position): Node {
        return this.updateByPath(position.path, (node) => node.deleteByOffset(position.offset));
    }

    insert(offset: number, node: Node): Node {
        assert(0 <= offset && offset <= this.length, `offset ${offset} is out of range [0, ${this.length}]`);

        const children = this.children.slice();
        children.splice(offset, 0, node);

        return this.copy({}, children);
    }

    insertByPosition(position: Position, node: Node): Node {
        if (position.path.depth === 0) return this.insert(position.offset, node);

        const oldChild = this.get(position.path.nodeIds[0]);
        if (oldChild === null) return this;

        const newChild = oldChild.insertByPosition(position.slice(1), node);
        if (newChild === oldChild) return this;

        return this.replace(position.path.nodeIds[0], newChild);
    }

    join(other: Node): Node[] {
        return [this, other];
    }

    split(offset: number): [before: Node | null, after: Node | null] {
        return [this, null];
    }

    splitByPosition(position: Position): [before: Node | null, after: Node | null] {
        if (position.path.depth === 0) return this.split(position.offset);

        const target = this.get(position.path.nodeIds[0]);
        assert(target !== null, 'target !== null');

        const targetOffset = this.children.findIndex((child) => child.id === target.id);
        assert(targetOffset !== -1, 'targetOffset !== -1');

        const [before, after] = target.splitByPosition(position.slice(1));
        const children1 = this.children.slice(0, targetOffset);
        const children2 = this.children.slice(targetOffset + 1);

        if (before !== null) children1.push(before);
        if (after !== null) children2.unshift(after);

        return [this.copy({}, children1, Node.generateId()), this.copy({}, children2, Node.generateId())];
    }

    findAncestor(startNodePath: Path, predicate: (node: Node) => boolean): Path | null {
        let path = startNodePath;
        do {
            const node = this.getByPath(path);
            if (node === null) return null;

            if (predicate(node)) return path;

            if (path.depth === 0) return null;
            path = path.parent();
        } while (path.depth > 0);

        return null;
    }
}

const logger = Logger.of(Node);
