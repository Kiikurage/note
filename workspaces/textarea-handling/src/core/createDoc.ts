import { RootNode } from './node/RootNode';
import { Position } from './Position';
import { Logger } from '../lib/logger';
import { DeleteResult, Doc, Node, NodeId } from './interfaces';
import { throwError } from '../lib/throwError';
import { isNotNullish } from '../lib/isNotNullish';
import { assert } from '../lib/assert';

export function createDoc(): Doc {
    const root = new RootNode();
    return new DocImpl(new Map(), new Map(), new Map([[root.id, root]]), root);
}

class DocImpl implements Doc {
    constructor(
        private readonly childIdsMap: ReadonlyMap<NodeId, readonly NodeId[]> = new Map(),
        private readonly parentIdMap: ReadonlyMap<NodeId, NodeId> = new Map(),
        private readonly nodesMap: ReadonlyMap<NodeId, Node> = new Map(),
        public readonly root: Node,
    ) {}

    getOrNull(nodeId: NodeId): Node | null {
        return this.nodesMap.get(nodeId) ?? null;
    }

    get(nodeId: NodeId): Node {
        return this.getOrNull(nodeId) ?? throwError(`Node not found: ${nodeId}`);
    }

    getByPositionOrNull(position: Position): Node | null {
        const childIds = this.childIdsMap.get(position.nodeId);
        if (childIds === undefined) return null;
        if (position.offset < 0 || position.offset >= childIds.length) return null;

        return this.getOrNull(childIds[position.offset]);
    }

    getByPosition(position: Position): Node {
        return this.getByPositionOrNull(position) ?? throwError(`Node not found: ${position}`);
    }

    getPositionOrNull(nodeId: NodeId): Position | null {
        const parentId = this.parentOrNull(nodeId)?.id ?? null;
        if (parentId === null) return null;

        const offset = this.offsetOrNull(nodeId);
        if (offset === null) return null;

        return Position.of(parentId, offset);
    }

    getPosition(nodeId: NodeId): Position {
        return this.getPositionOrNull(nodeId) ?? throwError(`Failed to get position of the given node: ${nodeId}`);
    }

    length(nodeId: NodeId): number {
        return this.get(nodeId).length(this);
    }

    parentOrNull(nodeId: NodeId): Node | null {
        const parentId = this.parentIdMap.get(nodeId);
        if (parentId === undefined) return null;

        return this.getOrNull(parentId);
    }

    parent(nodeId: NodeId): Node {
        return this.parentOrNull(nodeId) ?? throwError(`Failed to get parent of the given node: ${nodeId}`);
    }

    children(nodeId: NodeId): readonly Node[] {
        return (this.childIdsMap.get(nodeId) ?? []).map((childId) => this.getOrNull(childId)).filter(isNotNullish);
    }

    offsetOrNull(nodeId: NodeId): number | null {
        const offset = this.children(this.parent(nodeId).id).findIndex((child) => child.id === nodeId);
        if (offset === -1) return null;
        return offset;
    }

    offset(nodeId: NodeId): number {
        return this.offsetOrNull(nodeId) ?? throwError(`Failed to get offset of the given node: ${nodeId}`);
    }

    startPositionOrNull(nodeId: NodeId): Position | null {
        const parentId = this.parentOrNull(nodeId)?.id ?? null;
        if (parentId === null) return null;

        const offset = this.offsetOrNull(nodeId);
        if (offset === null) return null;

        return Position.of(parentId, offset);
    }

    startPosition(nodeId: NodeId): Position {
        return (
            this.startPositionOrNull(nodeId) ?? throwError(`Failed to get start position of the given node: ${nodeId}`)
        );
    }

    endPositionOrNull(nodeId: NodeId): Position | null {
        const parentId = this.parentOrNull(nodeId)?.id ?? null;
        if (parentId === null) return null;

        const offset = this.offsetOrNull(nodeId);
        if (offset === null) return null;

        return Position.of(parentId, offset + 1);
    }

    endPosition(nodeId: NodeId): Position {
        return this.endPositionOrNull(nodeId) ?? throwError(`Failed to get end position of the given node: ${nodeId}`);
    }

    prevPositionNodeOrNull(position: Position) {
        if (position.offset === 0) return null;

        const nodeId = this.getByPositionOrNull(position.prev())?.id ?? null;
        if (nodeId === null) return null;

        return this.getOrNull(nodeId);
    }

    prevPositionNode(position: Position) {
        return (
            this.prevPositionNodeOrNull(position) ??
            throwError(`Failed to get previous position of the given node: ${position}`)
        );
    }

    prevSiblingNodeOrNull(nodeId: NodeId): Node | null {
        const position = this.getPositionOrNull(nodeId);
        if (position === null) return null;
        if (position.offset === 0) return null;

        const siblingId = this.getByPositionOrNull(position.prev())?.id ?? null;
        if (siblingId === null) return null;

        return this.getOrNull(siblingId);
    }

    prevSiblingNode(nodeId: NodeId): Node {
        return (
            this.prevSiblingNodeOrNull(nodeId) ??
            throwError(`Failed to get previous sibling of the given node: ${nodeId}`)
        );
    }

    nextPositionNodeOrNull(position: Position): Node | null {
        const nodeId = this.getByPositionOrNull(position.next())?.id ?? null;
        if (nodeId === null) return null;

        return this.getOrNull(nodeId);
    }

    nextPositionNode(position: Position): Node {
        return (
            this.nextPositionNodeOrNull(position) ??
            throwError(`Failed to get next position of the given node: ${position}`)
        );
    }

    nextSiblingNodeOrNull(nodeId: NodeId): Node | null {
        const position = this.getPositionOrNull(nodeId);
        if (position === null) return null;

        const siblingId = this.getByPositionOrNull(position.next())?.id ?? null;
        if (siblingId === null) return null;

        return this.getOrNull(siblingId);
    }

    nextSiblingNode(nodeId: NodeId): Node {
        return (
            this.nextSiblingNodeOrNull(nodeId) ?? throwError(`Failed to get next sibling of the given node: ${nodeId}`)
        );
    }

    findAncestor(nodeId: NodeId, predicate: (node: Node) => boolean): Node | null {
        let currentId: NodeId | null = nodeId;
        while (currentId !== null) {
            const node = this.get(currentId);
            if (predicate(node)) return node;

            currentId = this.parentOrNull(currentId)?.id ?? null;
        }
        return null;
    }

    insert(position: Position, node: Node): Doc {
        const childIdsMap = new Map(this.childIdsMap);
        const parentIdMap = new Map(this.parentIdMap);
        const nodesMap = new Map(this.nodesMap);

        insertInPlace(childIdsMap, parentIdMap, nodesMap, position, node);

        return new DocImpl(childIdsMap, parentIdMap, nodesMap, this.root);
    }

    insertByPosition(position: Position, node: Node): Doc {
        return this.insert(position, node);
    }

    insertAfter(referenceNodeId: NodeId, node: Node): Doc {
        return this.insert(this.getPosition(referenceNodeId).next(), node);
    }

    insertBefore(referenceNodeId: NodeId, node: Node): Doc {
        return this.insert(this.getPosition(referenceNodeId), node);
    }

    insertFirst(parentId: NodeId, node: Node): Doc {
        return this.insert(Position.of(parentId, 0), node);
    }

    insertLast(parentId: NodeId, node: Node): Doc {
        const children = this.children(parentId);
        return this.insert(Position.of(parentId, children.length), node);
    }

    delete(nodeId: NodeId): DeleteResult {
        assert(nodeId !== this.root.id, 'Cannot delete root node');

        const childIdsMap = new Map(this.childIdsMap);
        const parentIdMap = new Map(this.parentIdMap);
        const nodesMap = new Map(this.nodesMap);

        deleteInPlace(childIdsMap, parentIdMap, nodesMap, nodeId);
        const position = this.getPosition(nodeId);
        return {
            doc: new DocImpl(childIdsMap, parentIdMap, nodesMap, this.root),
            from: position,
            to: position,
        };
    }

    deleteContentBackward(position: Position): DeleteResult {
        return this.get(position.nodeId).deleteContentBackward(this, position.offset);
    }

    deleteByRange(from: Position, to: Position): DeleteResult {
        if (from.nodeId === to.nodeId) return this.deleteByOffsetRange(from.nodeId, from.offset, to.offset);

        let nodeId = from.nodeId;
        const fullyIncluded = new Set<NodeId>();

        while (this.compare(this.endPosition(nodeId), to) < 0) {
            if (this.compare(from, this.startPosition(nodeId)) <= 0) fullyIncluded.add(nodeId);

            nodeId = this.nextSiblingNodeOrNull(nodeId)?.id ?? this.parent(nodeId).id;
        }

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const cmp = this.compare(this.endPosition(nodeId), to);
            if (cmp < 0) {
                fullyIncluded.add(nodeId);
                nodeId = this.nextSiblingNode(nodeId).id;
            } else if (cmp === 0) {
                fullyIncluded.add(nodeId);
                break;
            } else {
                const children = this.children(nodeId);
                if (children.length === 0) break;

                nodeId = children[0].id;
            }
        }

        let doc: Doc = this;
        for (const nodeId of fullyIncluded) {
            doc = doc.delete(nodeId).doc;
        }

        const result1 = doc.deleteToNodeEnd(from);
        const result2 = result1.doc.deleteFromNodeStart(to);

        return { doc: result2.doc, from: result1.from, to: result2.to };
    }

    deleteByOffsetRange(nodeId: NodeId, from: number, to: number): DeleteResult {
        if (from === to) {
            const position = Position.of(nodeId, from);
            return { doc: this, from: position, to: position };
        }

        return this.get(nodeId).deleteByOffsetRange(this, from, to);
    }

    deleteFromNodeStart(to: Position): DeleteResult {
        return this.deleteByOffsetRange(to.nodeId, 0, to.offset);
    }

    deleteToNodeEnd(from: Position): DeleteResult {
        return this.deleteByOffsetRange(from.nodeId, from.offset, this.length(from.nodeId));
    }

    splice(parentId: NodeId, offset: number, deleteCount: number, nodes: readonly Node[]): Doc {
        const childIdsMap = new Map(this.childIdsMap);
        const parentIdMap = new Map(this.parentIdMap);
        const nodesMap = new Map(this.nodesMap);

        spliceInPlace(childIdsMap, parentIdMap, nodesMap, parentId, offset, deleteCount, nodes);

        return new DocImpl(childIdsMap, parentIdMap, nodesMap, this.root);
    }

    replace(nodeId: NodeId, node: Node): Doc {
        const childIdsMap = new Map(this.childIdsMap);
        const parentIdMap = new Map(this.parentIdMap);
        const nodesMap = new Map(this.nodesMap);

        const oldNode = nodesMap.get(nodeId);
        if (oldNode === node) return this;

        spliceInPlace(childIdsMap, parentIdMap, nodesMap, this.parent(nodeId).id, this.offset(nodeId), 1, [node]);

        return new DocImpl(childIdsMap, parentIdMap, nodesMap, this.root);
    }

    update(nodeId: NodeId, updater: (node: Node) => Node): Doc {
        return this.replace(nodeId, updater(this.get(nodeId)));
    }

    getFullPath(nodeId: NodeId): NodeId[] {
        const path: NodeId[] = [];
        let currentId: NodeId | null = nodeId;
        while (currentId !== null) {
            path.unshift(currentId);
            currentId = this.parentOrNull(currentId)?.id ?? null;
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

    const childIds = (childIdsMap.get(position.nodeId) ?? []).slice();
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
    for (const childId of childIdsMap.get(nodeId) ?? []) {
        deleteInPlace(childIdsMap, parentIdMap, nodesMap, childId);
    }

    nodesMap.delete(nodeId);
    childIdsMap.delete(nodeId);

    const parentId = parentIdMap.get(nodeId) ?? null;
    if (parentId === null) return;

    const childIds = childIdsMap.get(parentId) ?? [];

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
    const deletedNodeIds = new Set(childIdsMap.get(parentId)?.slice(offset, offset + deleteCount));
    for (const [i, node] of nodes.entries()) {
        insertInPlace(childIdsMap, parentIdMap, nodesMap, Position.of(parentId, offset + i), node);
        deletedNodeIds.delete(node.id);
    }
    for (const deletedNodeId of deletedNodeIds) {
        deleteInPlace(childIdsMap, parentIdMap, nodesMap, deletedNodeId);
    }
}

const logger = Logger.of(DocImpl);
