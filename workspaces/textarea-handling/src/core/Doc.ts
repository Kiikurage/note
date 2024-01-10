import { assert, isNotNullish } from '../lib';
import { Node, NodeId } from './Node';
import { RootNode } from './node/RootNode';
import { Position } from './Position';
import { Logger } from '../lib/logger'; // eslint-disable-next-line @typescript-eslint/no-explicit-any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nonnull<F extends (...args: any[]) => any>(
    fn: F,
): F extends (...args: infer P) => infer R ? (...args: P) => NonNullable<R> : never {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: any, ...args: any[]) {
        const result = fn.apply(this, args);
        assert(result !== null, 'Result is null');
        return result;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
}

export class Doc {
    constructor(
        private readonly childIdsMap: ReadonlyMap<NodeId, readonly NodeId[]> = new Map(),
        private readonly parentIdMap: ReadonlyMap<NodeId, NodeId> = new Map(),
        private readonly nodesMap: ReadonlyMap<NodeId, Node> = new Map(),
        public readonly root: Node,
    ) {}

    static empty() {
        const root = new RootNode({});
        return new Doc(new Map(), new Map(), new Map([[root.id, root]]), root);
    }

    getOrNull(nodeId: NodeId) {
        return this.nodesMap.get(nodeId) ?? null;
    }

    readonly get = nonnull(this.getOrNull);

    getIdByPositionOrNull(position: Position): NodeId | null {
        return this.childIds(position.nodeId)[position.offset] ?? null;
    }

    readonly getIdByPosition = nonnull(this.getIdByPositionOrNull);

    getByPositionOrNull(position: Position): Node | null {
        const childId = this.getIdByPositionOrNull(position);
        if (childId === null) return null;

        return this.getOrNull(childId);
    }

    readonly getByPosition = nonnull(this.getByPositionOrNull);

    getPositionOrNull(nodeId: NodeId): Position | null {
        const parentId = this.parentIdOrNull(nodeId);
        if (parentId === null) return null;

        const offset = this.offsetOrNull(nodeId);
        if (offset === null) return null;

        return Position.of(parentId, offset);
    }

    readonly getPosition = nonnull(this.getPositionOrNull);

    parentOrNull(nodeId: NodeId): Node | null {
        const parentId = this.parentIdOrNull(nodeId);
        if (parentId === null) return null;

        return this.getOrNull(parentId);
    }

    readonly parent = nonnull(this.parentOrNull);

    parentIdOrNull(nodeId: NodeId): NodeId | null {
        return getParentId(this.parentIdMap, nodeId);
    }

    readonly parentId = nonnull(this.parentIdOrNull);

    children(nodeId: NodeId): readonly Node[] {
        return this.childIds(nodeId)
            .map((childId) => this.getOrNull(childId))
            .filter(isNotNullish);
    }

    childIds(nodeId: NodeId) {
        return getChildIds(this.childIdsMap, nodeId);
    }

    offsetOrNull(nodeId: NodeId): number | null {
        const offset = this.childIds(this.parentId(nodeId)).indexOf(nodeId);
        if (offset === -1) return null;
        return offset;
    }

    readonly offset = nonnull(this.offsetOrNull);

    firstChildIdOrNull(nodeId: NodeId): NodeId | null {
        return this.childIds(nodeId)[0] ?? null;
    }

    readonly firstChildId = nonnull(this.firstChildIdOrNull);

    lastChildIdOrNull(nodeId: NodeId): NodeId | null {
        const childIds = this.childIds(nodeId);
        return childIds[childIds.length - 1] ?? null;
    }

    readonly lastChildId = nonnull(this.lastChildIdOrNull);

    startPositionOrNull(nodeId: NodeId): Position | null {
        const parentId = this.parentIdOrNull(nodeId);
        if (parentId === null) return null;

        const offset = this.offsetOrNull(nodeId);
        if (offset === null) return null;

        return Position.of(parentId, offset);
    }

    readonly startPosition = nonnull(this.startPositionOrNull);

    endPositionOrNull(nodeId: NodeId): Position | null {
        const parentId = this.parentIdOrNull(nodeId);
        if (parentId === null) return null;

        const offset = this.offsetOrNull(nodeId);
        if (offset === null) return null;

        return Position.of(parentId, offset + 1);
    }

    readonly endPosition = nonnull(this.endPositionOrNull);

    prevPositionNodeIdOrNull(position: Position): NodeId | null {
        if (position.offset === 0) return null;
        return this.getIdByPositionOrNull(position.prev());
    }

    readonly prevPositionNodeId = nonnull(this.prevPositionNodeIdOrNull);

    prevPositionNodeOrNull(position: Position) {
        const nodeId = this.prevPositionNodeIdOrNull(position);
        if (nodeId === null) return null;

        return this.getOrNull(nodeId);
    }

    readonly prevPositionNode = nonnull(this.prevPositionNodeOrNull);

    prevSiblingNodeIdOrNull(nodeId: NodeId): NodeId | null {
        const position = this.getPositionOrNull(nodeId);
        if (position === null) return null;

        return this.prevPositionNodeIdOrNull(position);
    }

    readonly prevSiblingNodeId = nonnull(this.prevSiblingNodeIdOrNull);

    prevSiblingNodeOrNull(nodeId: NodeId): Node | null {
        const siblingId = this.prevSiblingNodeIdOrNull(nodeId);
        if (siblingId === null) return null;

        return this.getOrNull(siblingId);
    }

    readonly prevSiblingNode = nonnull(this.prevSiblingNodeOrNull);

    nextPositionNodeIdOrNull(position: Position): NodeId | null {
        return this.getIdByPositionOrNull(position.next());
    }

    readonly nextPositionNodeId = nonnull(this.nextPositionNodeIdOrNull);

    nextPositionNodeOrNull(position: Position): Node | null {
        const nodeId = this.nextPositionNodeIdOrNull(position);
        if (nodeId === null) return null;

        return this.getOrNull(nodeId);
    }

    readonly nextPositionNode = nonnull(this.nextPositionNodeOrNull);

    nextSiblingNodeIdOrNull(nodeId: NodeId): NodeId | null {
        const position = this.getPositionOrNull(nodeId);
        if (position === null) return null;

        return this.nextPositionNodeIdOrNull(position);
    }

    readonly nextSiblingNodeId = nonnull(this.nextSiblingNodeIdOrNull);

    nextSiblingNodeOrNull(nodeId: NodeId): Node | null {
        const siblingId = this.nextSiblingNodeIdOrNull(nodeId);
        if (siblingId === null) return null;

        return this.getOrNull(siblingId);
    }

    readonly nextSiblingNode = nonnull(this.nextSiblingNodeOrNull);

    findAncestor(nodeId: NodeId, predicate: (node: Node) => boolean): NodeId | null {
        let currentId: NodeId | null = nodeId;
        while (currentId !== null) {
            if (predicate(this.get(currentId))) return currentId;

            currentId = this.parentIdOrNull(currentId);
        }
        return null;
    }

    insert(position: Position, node: Node) {
        const childIdsMap = new Map(this.childIdsMap);
        const parentIdMap = new Map(this.parentIdMap);
        const nodesMap = new Map(this.nodesMap);

        insertInPlace(childIdsMap, parentIdMap, nodesMap, position, node);

        return new Doc(childIdsMap, parentIdMap, nodesMap, this.root);
    }

    insertByPosition(position: Position, node: Node) {
        return this.insert(position, node);
    }

    insertAfter(referenceNodeId: NodeId, node: Node) {
        return this.insert(this.getPosition(referenceNodeId).next(), node);
    }

    insertBefore(referenceNodeId: NodeId, node: Node) {
        return this.insert(this.getPosition(referenceNodeId), node);
    }

    insertFirst(parentId: NodeId, node: Node) {
        return this.insert(Position.of(parentId, 0), node);
    }

    insertLast(parentId: NodeId, node: Node) {
        const childIds = this.childIds(parentId);
        return this.insert(Position.of(parentId, childIds.length), node);
    }

    delete(nodeId: NodeId) {
        const childIdsMap = new Map(this.childIdsMap);
        const parentIdMap = new Map(this.parentIdMap);
        const nodesMap = new Map(this.nodesMap);

        deleteInPlace(childIdsMap, parentIdMap, nodesMap, nodeId);

        return new Doc(childIdsMap, parentIdMap, nodesMap, this.root);
    }

    splice(parentId: NodeId, offset: number, deleteCount: number, nodes: readonly Node[]) {
        const childIdsMap = new Map(this.childIdsMap);
        const parentIdMap = new Map(this.parentIdMap);
        const nodesMap = new Map(this.nodesMap);

        spliceInPlace(childIdsMap, parentIdMap, nodesMap, parentId, offset, deleteCount, nodes);

        return new Doc(childIdsMap, parentIdMap, nodesMap, this.root);
    }

    replace(nodeId: NodeId, node: Node) {
        const childIdsMap = new Map(this.childIdsMap);
        const parentIdMap = new Map(this.parentIdMap);
        const nodesMap = new Map(this.nodesMap);

        const oldNode = nodesMap.get(nodeId);
        if (oldNode === node) return this;

        spliceInPlace(childIdsMap, parentIdMap, nodesMap, this.parentId(nodeId), this.offset(nodeId), 1, [node]);

        return new Doc(childIdsMap, parentIdMap, nodesMap, this.root);
    }

    update(nodeId: NodeId, updater: (node: Node) => Node) {
        return this.replace(nodeId, updater(this.get(nodeId)));
    }

    getFullPath(nodeId: NodeId): NodeId[] {
        const path: NodeId[] = [];
        let currentId: NodeId | null = nodeId;
        while (currentId !== null) {
            path.unshift(currentId);
            currentId = this.parentIdOrNull(currentId);
        }
        assert(path[0] === this.root.id, 'Node is not a descendant of the root');
        return path;
    }

    compare(pos1: Position | NodeId, pos2: Position | NodeId): -1 | 0 | 1 {
        if (typeof pos1 === 'number') return this.compare(Position.of(pos1), pos2);
        if (typeof pos2 === 'number') return this.compare(pos1, Position.of(pos2));

        const path1 = this.getFullPath(pos1.nodeId);
        const path2 = this.getFullPath(pos2.nodeId);

        const pathLength = Math.min(path1.length, path2.length);

        assert(path1[0] === path2[0], 'Nodes are not in the same document');

        for (let i = 1; i < pathLength; i++) {
            const id1 = path1[i];
            const id2 = path2[i];
            if (id1 === id2) continue;

            const offset1 = this.offset(id1);
            const offset2 = this.offset(id2);

            return offset1 < offset2 ? -1 : 1;
        }

        if (path1.length < path2.length) {
            const offset2 = this.offset(path2[pathLength]);
            return pos1.offset <= offset2 ? -1 : 1;
        }

        if (path1.length > path2.length) {
            const offset1 = this.offset(path1[pathLength]);
            return pos2.offset <= offset1 ? 1 : -1;
        }

        return pos1.offset < pos2.offset ? -1 : pos1.offset > pos2.offset ? 1 : 0;
    }
}

function getChildIds(childIdsMap: ReadonlyMap<NodeId, readonly NodeId[]>, nodeId: NodeId): readonly NodeId[] {
    return childIdsMap.get(nodeId) ?? [];
}

function getParentId(parentIdMap: ReadonlyMap<NodeId, NodeId>, nodeId: NodeId): NodeId | null {
    return parentIdMap.get(nodeId) ?? null;
}

function insertInPlace(
    childIdsMap: Map<NodeId, readonly NodeId[]>,
    parentIdMap: Map<NodeId, NodeId>,
    nodesMap: Map<NodeId, Node>,
    position: Position,
    node: Node,
) {
    assert(nodesMap.has(position.nodeId), 'Parent does not exist');

    const oldParent = parentIdMap.get(node.id);
    if (oldParent !== undefined) {
        childIdsMap.set(oldParent, childIdsMap.get(oldParent)?.filter((id) => id !== node.id) ?? []);
        parentIdMap.delete(node.id);
    }

    const childIds = getChildIds(childIdsMap, position.nodeId).slice();
    childIds.splice(position.offset, 0, node.id);

    childIdsMap.set(position.nodeId, childIds);
    parentIdMap.set(node.id, position.nodeId);
    nodesMap.set(node.id, node);
}

function deleteInPlace(
    childIdsMap: Map<NodeId, readonly NodeId[]>,
    parentIdMap: Map<NodeId, NodeId>,
    nodesMap: Map<NodeId, Node>,
    nodeId: NodeId,
) {
    for (const childId of getChildIds(childIdsMap, nodeId)) {
        deleteInPlace(childIdsMap, parentIdMap, nodesMap, childId);
    }

    nodesMap.delete(nodeId);
    childIdsMap.delete(nodeId);

    const parentId = getParentId(parentIdMap, nodeId);
    if (parentId === null) return;

    const childIds = getChildIds(childIdsMap, parentId);

    const offset = childIds.indexOf(nodeId);
    assert(offset !== -1, 'Node is not a child of its parent');

    if (childIds.length === 1) {
        childIdsMap.delete(parentId);
    } else {
        const newChildIds = childIds.slice();
        newChildIds.splice(offset, 1);
        childIdsMap.set(parentId, newChildIds);
    }
    parentIdMap.delete(nodeId);
}

function spliceInPlace(
    childIdsMap: Map<NodeId, readonly NodeId[]>,
    parentIdMap: Map<NodeId, NodeId>,
    nodesMap: Map<NodeId, Node>,
    parentId: NodeId,
    offset: number,
    deleteCount: number,
    nodes: readonly Node[],
) {
    const deletedNodeIds = new Set(getChildIds(childIdsMap, parentId).slice(offset, offset + deleteCount));
    for (const [i, node] of nodes.entries()) {
        insertInPlace(childIdsMap, parentIdMap, nodesMap, Position.of(parentId, offset + i), node);
        deletedNodeIds.delete(node.id);
    }
    for (const deletedNodeId of deletedNodeIds) {
        deleteInPlace(childIdsMap, parentIdMap, nodesMap, deletedNodeId);
    }
}

const logger = Logger.of(Doc);
