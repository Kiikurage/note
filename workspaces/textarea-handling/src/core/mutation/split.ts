import { TextNode } from '../node/TextNode';
import { ContainerNode } from '../node/ContainerNode';
import { Doc } from '../Doc';
import { Node, NodeId } from '../Node';
import { Position } from '../Position';
import { assert } from '../../lib';

/**
 * Split node into two nodes.
 * - If the node is not split-able, do nothing.
 * - If node is split-able,
 *      - After split, the left node has the same ID as the original node's ID.
 *      - The right node is newly created node.
 *      - Sum of 2 new nodes' length is the same as the original node's length.
 *          - Position(leftNewNode, offset) === Position(originalNode, offset).
 *          - Position(rightNewNode, offset) === Position(originalNode, offset - leftNewNode.length).
 * - Split is completely reverse operation of merge.
 *      - [left, right] = split(doc, Position.of(original)) <=> original = merge(doc, Position.of(left), Position.of(right))
 */
export function split(doc: Doc, position: Position): Doc {
    const node = doc.get(position.nodeId);

    if (node instanceof TextNode) {
        const leftText = node.text.slice(0, position.offset);
        const rightText = node.text.slice(position.offset);
        return doc.replace(node.id, node.setText(leftText)).insertAfter(node.id, new TextNode({ text: rightText }));
    }

    if (node instanceof ContainerNode) {
        const rightChildIds = doc.childIds(node.id).slice(position.offset);
        const rightNode = node.copy({}, Node.generateId());

        doc = doc.insertAfter(node.id, rightNode);
        for (const childId of rightChildIds) {
            doc = doc.insertLast(rightNode.id, doc.get(childId));
        }
        return doc;
    }

    return doc;
}

/**
 * Split sub tree.
 */
export function splitRecursively(doc: Doc, rootNodeId: NodeId, position: Position): Doc {
    const parentOfRootId = doc.parentId(rootNodeId);
    assert(
        doc.findAncestor(position.nodeId, (node) => node.id === parentOfRootId) !== null,
        `split target:${position.nodeId} is not descendant of root:${rootNodeId}`,
    );

    while (position.nodeId !== parentOfRootId) {
        doc = split(doc, position);
        position = doc.endPosition(position.nodeId);
    }

    return doc;
}
