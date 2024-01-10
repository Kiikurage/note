import { TextNode } from '../node/TextNode';
import { ContainerNode } from '../node/ContainerNode';
import { Doc } from '../Doc';
import { Position } from '../Position';

/**
 * Merge two adjacent nodes.
 * - If the two nodes are not adjacent, throw error.
 * - If two nodes are not merge-able, do nothing.
 *
 * - If merge-able,
 *      - New node always has the left node's ID.
 *      - New node has the same length as the sum of left and right nodes.
 *          - Position(leftNode, offset) is still valid after the merge.
 *          - Position(rightNode, offset) will be changed to Position(leftNode, originalLeftNodeLength + offset).
 */
export function merge(doc: Doc, position: Position): Doc {
    const leftPosition = position.prev();
    const rightPosition = position;
    const leftNode = doc.getByPosition(leftPosition);
    const rightNode = doc.getByPosition(rightPosition);

    if (leftNode.type !== rightNode.type) return doc;

    if (leftNode instanceof TextNode && rightNode instanceof TextNode) {
        return doc.replace(leftNode.id, leftNode.setText(leftNode.text + rightNode.text)).delete(rightNode.id);
    }

    if (leftNode instanceof ContainerNode && rightNode instanceof ContainerNode) {
        const leftNodeIdChildIds = doc.childIds(leftNode.id);
        const rightNodeIdChildren = doc.children(rightNode.id);
        return doc.splice(leftNode.id, leftNodeIdChildIds.length, 0, rightNodeIdChildren).delete(rightNode.id);
    }

    return doc;
}
