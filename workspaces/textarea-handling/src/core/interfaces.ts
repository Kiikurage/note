import { Position } from './Position';
import { counter } from '../lib/counter';

export type NodeId = number;

export interface Doc {
    readonly root: Node;

    getOrNull(nodeId: NodeId): Node | null;

    get(nodeId: NodeId): Node;

    getByPositionOrNull(position: Position): Node | null;

    getByPosition(position: Position): Node;

    getPositionOrNull(nodeId: NodeId): Position | null;

    getPosition(nodeId: NodeId): Position;

    length(nodeId: NodeId): number;

    parentOrNull(nodeId: NodeId): Node | null;

    parent(nodeId: NodeId): Node;

    children(nodeId: NodeId): readonly Node[];

    offsetOrNull(nodeId: NodeId): number | null;

    offset(nodeId: NodeId): number;

    startPositionOrNull(nodeId: NodeId): Position | null;

    startPosition(nodeId: NodeId): Position;

    endPositionOrNull(nodeId: NodeId): Position | null;

    endPosition(nodeId: NodeId): Position;

    prevPositionNodeOrNull(position: Position): Node | null;

    prevPositionNode(position: Position): Node;

    prevSiblingNodeOrNull(nodeId: NodeId): Node | null;

    prevSiblingNode(nodeId: NodeId): Node;

    nextPositionNodeOrNull(position: Position): Node | null;

    nextPositionNode(position: Position): Node;

    nextSiblingNodeOrNull(nodeId: NodeId): Node | null;

    nextSiblingNode(nodeId: NodeId): Node;

    findAncestor(nodeId: NodeId, predicate: (node: Node) => boolean): Node | null;

    insert(position: Position, node: Node): Doc;

    insertByPosition(position: Position, node: Node): Doc;

    insertAfter(referenceNodeId: NodeId, node: Node): Doc;

    insertBefore(referenceNodeId: NodeId, node: Node): Doc;

    insertFirst(parentId: NodeId, node: Node): Doc;

    insertLast(parentId: NodeId, node: Node): Doc;

    delete(nodeId: NodeId): DeleteResult;

    deleteContentBackward(position: Position): DeleteResult;

    deleteByRange(from: Position, to: Position): DeleteResult;

    deleteByOffsetRange(nodeId: NodeId, from: number, to: number): DeleteResult;

    deleteFromNodeStart(to: Position): DeleteResult;

    deleteToNodeEnd(from: Position): DeleteResult;

    splice(parentId: NodeId, offset: number, deleteCount: number, nodes: readonly Node[]): Doc;

    replace(nodeId: NodeId, node: Node): Doc;

    update(nodeId: NodeId, updater: (node: Node) => Node): Doc;

    getFullPath(nodeId: NodeId): NodeId[];

    compare(pos1: Position | NodeId, pos2: Position | NodeId): -1 | 0 | 1;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeConstructor = new (props: any, id?: number) => Node;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeTypeOf<T extends NodeConstructor> = T extends new (props: any, id: number) => infer R ? R : never;

export module Node {
    export const generateId = counter();

    export function getTypeName(nodeConstructor: NodeConstructor): string {
        if ('displayName' in nodeConstructor && typeof nodeConstructor.displayName === 'string') {
            return nodeConstructor.displayName;
        }

        return nodeConstructor.name;
    }
}

export interface Node {
    readonly id: NodeId;
    readonly type: string;

    /**
     * Size of this node.
     * - All positions from (this.id, 0) to (this.id, this.length) are valid.
     */
    length(doc: Doc): number;

    /**
     * Split subtree under this node at the given position into two nodes .
     * - If the given position is not in the subtree under this node, throw error.
     * - If the node is not split-able, do nothing.
     *     - result.left will be the original node, and result.right will be null.
     * - If position.offset is 0, node is not split
     *     - result.left will be null, and result.right will be the original node.
     * - If position.offset equals to node.length(doc), node is not split
     *     - result.left will be the original node, and result.right will be null.
     * - Otherwise, node is split into 2 nodes.
     *     - After split, the left node has the same ID as the original node's ID.
     *     - The right node is newly created node.
     *     - Sum of 2 new nodes' length is the same as the original node's length.
     *         - Position(leftNewNode, offset) === Position(originalNode, offset).
     *         - Position(rightNewNode, offset) === Position(originalNode, offset - leftNewNode.length).
     *     - Split is semantically reverse operation of merge.
     *         - { doc:newDoc, left, right } = original.split(oldDoc, Position.of(original))
     *               <=> oldDoc = left.merge(newDoc, right.id)
     */
    split(doc: Doc, position: Position): SplitResult;

    /**
     * Merge subtree under this node with the subtree under the next sibling node.
     * - If there is no sibling node next to this node, do nothing.
     * - For each pair of nodes at the most right path in this subtree and the most left path in the next subtree,
     *   from the top to the bottom, merge them. If nodes are not merge-able, stop merging there.
     *      - If nodes are not merge-able, do nothing.
     *      - If merge-able,
     *          - New node always has the left node's ID.
     *          - New node has the same length as the sum of left and right nodes.
     *              - Position(leftNode, offset) is still valid after the merge.
     *              - Position(rightNode, offset) will be changed to Position(leftNode, originalLeftNodeLength + offset).
     */
    merge(doc: Doc): MergeResult;

    /**
     * Insert text.
     *
     * - If the given position is a TextNode, insert text into that text node.
     * - If the given position is after TextNode, insert text at the beginning of that text node.
     * - If the given position is before TextNode, insert text at the end of that text node.
     * - If the given position is descendant of a ParagraphNode, insert TextNode into that ParagraphNode and insert text there.
     * - otherwise, insert ParagraphNode and TextNode into the given position, and insert text there.
     */
    insertText(doc: Doc, offset: number, text: string): InsertTextResult;

    /**
     * Insert paragraph break
     */
    insertParagraph(doc: Doc, offset: number): InsertNodeResult;

    /**
     * Delete 1 character backwardly.
     */
    deleteContentBackward(doc: Doc, offset: number): DeleteResult;

    /**
     * Delete forward.
     */
    deleteContentForward(doc: Doc, offset: number): DeleteResult;

    /**
     * Delete contents in the given offset range.
     */
    deleteByOffsetRange(doc: Doc, from: number, to: number): DeleteResult;
}

export interface InsertTextResult {
    doc: Doc;
    from: Position;
    to: Position;
}

export interface InsertNodeResult {
    doc: Doc;
    nodeId: NodeId | null;
}

export interface SplitResult {
    doc: Doc;
    left: Node | null;
    right: Node | null;
}

export interface MergeResult {
    doc: Doc;
    position: Position;
}

export interface DeleteResult {
    doc: Doc;

    /**
     * Position of each end of deletion range after the deletion. For simple deletion such as deleting a character, they are same.
     * For complex deletion such as deleting multiple nodes, they can be different. When deletion failed, return the original position
     */
    from: Position;
    to: Position;
}
