import { Position } from '../core/Position';
import { Logger } from '../lib/logger';
import { Doc, Node } from '../core/interfaces';
import { assert } from '../lib/assert';

export function wrapContents(doc: Doc, from: Position, to: Position, wrapper: Node): WrapContentsResult {
    assert(from.nodeId === to.nodeId, 'from.path === to.path');

    doc = doc.get(to.nodeId).split(doc, to).doc;
    const splitResult = doc.get(from.nodeId).split(doc, from);
    doc = splitResult.doc;

    const mid = splitResult.right ?? splitResult.left;
    assert(mid !== null, 'mid !== null');

    doc = doc.insertAfter(from.nodeId, wrapper);
    doc = doc.insertFirst(wrapper.id, mid);

    return {
        doc,
        from: Position.of(mid.id, 0),
        to: Position.of(mid.id, doc.length(mid.id)),
    };
}

interface WrapContentsResult {
    doc: Doc;
    from: Position;
    to: Position;
}
