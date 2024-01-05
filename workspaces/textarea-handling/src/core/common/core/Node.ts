import { Logger } from '../../../lib/logger';
import { assert } from '../../../lib';
import { Path } from './Path';
import { Position } from './Position';

const generateId = (() => {
    let id = 0;
    return () => id++;
})();

export class Node<Props extends Record<string, unknown> = Record<string, unknown>> {
    readonly isContainer: boolean = true;

    constructor(
        readonly props: Props,
        readonly children: readonly Node[] = [],
        readonly id = generateId(),
    ) {}

    get type() {
        if ('displayName' in this.constructor && typeof this.constructor.displayName === 'string') {
            return this.constructor.displayName;
        }

        return this.constructor.name;
    }

    copy(props: Partial<Props>, children: readonly Node[] = []): this {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new (this as any).constructor({ ...this.props, ...props }, children, this.id);
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

    delete(nodeId: number): Node {
        const children = this.children.slice();
        const offset = children.findIndex((child) => child.id === nodeId);
        if (offset === -1) return this;
        children.splice(offset, 1);

        return this.copy({}, children);
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

    insert(offset: number, node: Node): Node {
        assert(
            0 <= offset && offset <= this.children.length,
            `offset ${offset} is out of range [0, ${this.children.length}]`,
        );

        const children = this.children.slice();
        children.splice(offset, 0, node);

        return this.copy({}, children);
    }

    insertByPosition(position: Position, node: Node): Node {
        if (position.path.depth === 0) return this.insert(position.offset, node);

        const oldChild = this.get(position.path.nodeIds[0]);
        if (oldChild === null) return this;

        const newChild = oldChild.insertByPosition(Position.of(position.path.slice(1), position.offset), node);
        if (newChild === oldChild) return this;

        return this.replace(position.path.nodeIds[0], newChild);
    }
}

const logger = Logger.of(Node);
