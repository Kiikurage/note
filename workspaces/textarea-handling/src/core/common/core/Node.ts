import { Logger } from '../../../lib/logger';
import { assert } from '../../../lib';
import { Path } from './Path';
import { Position } from './Position';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeConstructor = new (props: any, children?: Node[], id?: number) => Node<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeTypeOf<T extends NodeConstructor> = T extends new (props: any, children: Node[], id: number) => infer R
    ? R
    : never;

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

    static getTypeName(nodeConstructor: NodeConstructor): string {
        if ('displayName' in nodeConstructor && typeof nodeConstructor.displayName === 'string') {
            return nodeConstructor.displayName;
        }

        return nodeConstructor.name;
    }

    get type() {
        return Node.getTypeName(this.constructor as NodeConstructor);
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

    findAncestor(startNodePath: Path, predicate: (node: Node, path: Path) => boolean): Path | null {
        let path = startNodePath;
        do {
            const node = this.getByPath(path);
            if (node === null) return null;

            if (predicate(node, path)) return path;

            if (path.depth === 0) return null;
            path = path.parent();
        } while (path.depth > 0);

        return null;
    }

    splice(start: number, deleteCount: number, ...nodes: Node[]): Node {
        const children = this.children.slice();
        children.splice(start, deleteCount, ...nodes);
        return this.copy({}, children);
    }

    spliceByPosition(start: Position, deleteCount: number, ...nodes: Node[]): Node {
        return this.updateByPath(start.path, (node) => node.splice(start.offset, deleteCount, ...nodes));
    }

    replace(nodeId: number, node: Node): Node {
        const children = this.children.slice();
        const offset = children.findIndex((child) => child.id === nodeId);
        if (offset === -1) return this;

        return this.splice(offset, 1, node);
    }

    replaceByPath(path: Path, node: Node): Node {
        if (path.depth === 0) return node;

        const oldChild = this.get(path.nodeIds[0]);
        if (oldChild === null) return this;

        const newChild = oldChild.replaceByPath(path.slice(1), node);
        if (newChild === oldChild) return this;

        return this.replace(path.nodeIds[0], newChild);
    }

    updateByPath(path: Path, updater: (node: Node) => Node): Node {
        if (path.depth === 0) return updater(this);

        const oldChild = this.get(path.nodeIds[0]);
        if (oldChild === null) return this;

        const newChild = oldChild.updateByPath(path.slice(1), updater);
        if (newChild === oldChild) return this;

        return this.replace(path.nodeIds[0], newChild);
    }

    deleteByOffset(offset: number): Node {
        return this.splice(offset, 1);
    }

    delete(nodeId: number): Node {
        const children = this.children.slice();
        const offset = children.findIndex((child) => child.id === nodeId);
        return this.deleteByOffset(offset);
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

        return this.splice(offset, 0, node);
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

    comparePath(path1: Path, path2: Path): -1 | 0 | 1 {
        if (path1.depth === 0 && path2.depth === 0) return 0;
        if (path1.depth === 0) return -1;
        if (path2.depth === 0) return 1;

        const nodeId1 = path1.nodeIds[0];
        const nodeId2 = path2.nodeIds[0];

        const offset1 = this.children.findIndex((child) => child.id === nodeId1);
        const offset2 = this.children.findIndex((child) => child.id === nodeId2);
        assert(offset1 !== -1, 'offset1 !== -1');
        assert(offset2 !== -1, 'offset2 !== -1');

        if (offset1 < offset2) return -1;
        if (offset1 > offset2) return 1;

        const node = this.children[offset1];
        assert(node !== undefined, 'node !== undefined');

        return node.comparePath(path1.slice(1), path2.slice(1));
    }

    comparePosition(position1: Position, position2: Position): -1 | 0 | 1 {
        const result = this.comparePath(position1.path, position2.path);
        if (result !== 0) return result;

        if (position1.offset < position2.offset) return -1;
        if (position1.offset > position2.offset) return 1;

        return 0;
    }

    /**
     * For given range, compute 3 node sets:
     * 1. nodes whose end is in the range
     * 2. nodes completely in the range
     * 3. nodes whose start is in the range
     */
    computeCoveredNodes(from: Position, to: Position): ComputeCoveredNodesResult {
        let rightCoveredPath: Path | null = null;
        const fullyCoveredPaths: Path[] = [];
        let leftCoveredPath: Path | null = null;
        let path = from.path;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (this.comparePosition(this.getEndPosition(path), to) >= 0) break;
            if (this.comparePosition(this.getStartPosition(path), from) >= 0) {
                fullyCoveredPaths.push(path);
            } else {
                if (rightCoveredPath === null) rightCoveredPath = path;
            }

            if (path.isRoot) break;
            const parent = this.getByPath(path.parent());
            assert(parent !== null, 'parent !== null');

            const offset = parent.children.findIndex((child) => child.id === path.nodeIds[path.depth - 1]);
            assert(offset !== -1, 'offset !== -1');

            if (offset === parent.children.length - 1) {
                path = path.parent();
            } else {
                path = path.parent().child(parent.children[offset + 1].id);
            }
        }

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const cmp = this.comparePosition(this.getEndPosition(path), to);
            if (cmp > 0) {
                leftCoveredPath = path;
                const node = this.getByPath(path);
                assert(node !== null, 'node !== null');
                if (node.children.length === 0) break;

                path = path.child(node.children[node.children.length - 1].id);
            } else {
                fullyCoveredPaths.push(path);
                if (cmp === 0) break;

                const parent = this.getByPath(path.parent());
                assert(parent !== null, 'parent !== null');

                const offset = parent.children.findIndex((child) => child.id === path.nodeIds[path.depth - 1]);
                assert(offset !== -1, 'offset !== -1');

                if (offset === parent.children.length - 1) {
                    break;
                } else {
                    path = path.parent().child(parent.children[offset + 1].id);
                }
            }
        }

        return { rightCoveredPath, fullyCoveredPaths, leftCoveredPath };
    }

    getStartPosition(path: Path): Position {
        return Position.of(path);
    }

    getEndPosition(path: Path): Position {
        const node = this.getByPath(path);
        assert(node !== null, 'node !== null');

        if (node.children.length === 0) return Position.of(path, node.length);

        return this.getEndPosition(path.child(node.children[node.children.length - 1].id));
    }
}

interface ComputeCoveredNodesResult {
    readonly rightCoveredPath: Path | null;
    readonly fullyCoveredPaths: readonly Path[];
    readonly leftCoveredPath: Path | null;
}

const logger = Logger.of(Node);
