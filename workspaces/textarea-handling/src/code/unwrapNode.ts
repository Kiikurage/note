import { Position } from '../core/Position';
import { Logger } from '../lib/logger';
import { Doc, NodeId } from '../core/interfaces';

export function unwrapNode(doc: Doc, nodeId: NodeId): UnwrapNodeResult {
    const node = doc.get(nodeId);

    const children = doc.children(node.id);
    if (children.length === 0) {
        return {
            doc: doc.delete(node.id).doc,
            from: doc.getPosition(node.id),
            to: doc.getPosition(node.id),
        };
    }

    const firstChild = children[0];
    const lastChild = children[children.length - 1];

    for (const child of children) {
        doc = doc.insertAfter(node.id, child);
    }
    doc = doc.delete(node.id).doc;
    let from = Position.of(firstChild.id, 0);
    let to = Position.of(lastChild.id, doc.length(lastChild.id));

    doc = lastChild.merge(doc).doc;

    const beforeFirstChild = doc.prevSiblingNodeOrNull(firstChild.id);
    if (beforeFirstChild !== null) {
        const beforeFirstChildLength = doc.length(beforeFirstChild.id);
        const newDoc = beforeFirstChild.merge(doc).doc;
        if (newDoc !== doc) {
            from = Position.of(beforeFirstChild.id, beforeFirstChildLength);
            if (firstChild === lastChild) {
                to = Position.of(beforeFirstChild.id, beforeFirstChildLength + to.offset);
            }
            doc = newDoc;
        }
    }

    return { doc, from, to };
}

interface UnwrapNodeResult {
    doc: Doc;
    from: Position;
    to: Position;
}

const logger = Logger.of(unwrapNode);
