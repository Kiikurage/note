import { Doc } from '../Doc';
import { Position } from '../Position';
import { NodeId } from '../Node';
import { TextNode } from '../node/TextNode';
import { ContainerNode } from '../node/ContainerNode';

/**
 * Delete contents in the range
 *  - If entire nodes are included in the range, delete those nodes.
 *  - If a node is partially included in the range, delete the range in that node.
 *      - If node is a TextNode, delete the text in that range.
 *      - If node is a ContainerNode, delete the child nodes in that range.
 */
export function deleteByRange(doc: Doc, from: Position, to: Position) {
    if (from.nodeId === to.nodeId) {
        return deleteByOffsetRange(doc, from.nodeId, from.offset, to.offset);
    }

    let nodeId = from.nodeId;

    const fullyIncluded = new Set<NodeId>();

    while (doc.compare(doc.endPosition(nodeId), to) < 0) {
        if (doc.compare(from, doc.startPosition(nodeId)) <= 0) fullyIncluded.add(nodeId);

        nodeId = doc.nextSiblingNodeOrNull(nodeId)?.id ?? doc.parentId(nodeId);
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const cmp = doc.compare(doc.endPosition(nodeId), to);
        if (cmp < 0) {
            fullyIncluded.add(nodeId);
            nodeId = doc.nextSiblingNodeId(nodeId);
        } else if (cmp === 0) {
            fullyIncluded.add(nodeId);
            break;
        } else {
            const childIds = doc.childIds(nodeId);
            if (childIds.length === 0) break;

            nodeId = childIds[0];
        }
    }

    for (const nodeId of fullyIncluded) {
        doc = doc.delete(nodeId);
    }

    doc = deleteToNodeEnd(doc, from);
    doc = deleteFromNodeStart(doc, to);

    return doc;
}

function deleteByOffsetRange(doc: Doc, nodeId: NodeId, from: number, to: number): Doc {
    if (from === to) return doc;

    const node = doc.get(nodeId);
    if (node instanceof TextNode) {
        return doc.replace(node.id, node.splice(from, to - from));
    } else {
        return doc.splice(nodeId, from, to - from, []);
    }
}

function deleteFromNodeStart(doc: Doc, to: Position): Doc {
    return deleteByOffsetRange(doc, to.nodeId, 0, to.offset);
}

function deleteToNodeEnd(doc: Doc, from: Position): Doc {
    const node = doc.get(from.nodeId);

    if (node instanceof TextNode) {
        return deleteByOffsetRange(doc, from.nodeId, from.offset, node.length);
    }

    if (node instanceof ContainerNode) {
        const childIds = doc.childIds(node.id);
        return deleteByOffsetRange(doc, from.nodeId, from.offset, childIds.length);
    }

    return doc;
}
