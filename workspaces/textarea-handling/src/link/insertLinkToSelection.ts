import { EditorState } from '../core/EditorState';
import { assert } from '../lib';
import { LinkNode } from './LinkNode';
import { Position } from '../core/Position';
import { Logger } from '../lib/logger';
import { Cursor } from '../core/Cursor';
import { Doc } from '../core/Doc';
import { split } from '../core/mutation/split';

export function insertLinkToSelection(state: EditorState) {
    if (state.cursor.collapsed) return state;

    const [from, to] = state.cursor.getRange(state.doc);
    if (from.nodeId !== to.nodeId) {
        logger.warn('Insert link with multiple nodes are not supported yet.');
        return state;
    }

    const { doc, links } = insertLink(state.doc, from, to);
    const lastLinkNode = links[links.length - 1];

    return state.copy({
        doc,
        cursor: Cursor.of(doc.nextSiblingNodeId(lastLinkNode.id), 0),
    });
}

function insertLink(doc: Doc, from: Position, to: Position): InsertLinkResult {
    assert(from.nodeId === to.nodeId, 'from.path === to.path');

    doc = split(doc, to);
    doc = split(doc, from);

    const mid = doc.nextSiblingNode(from.nodeId);

    const link = new LinkNode({ href: 'https://example.com' });
    doc = doc.insertAfter(from.nodeId, link);
    doc = doc.insertFirst(link.id, mid);

    return {
        doc,
        links: [link],
    };
}

interface InsertLinkResult {
    doc: Doc;
    links: LinkNode[];
}

const logger = Logger.of(insertLinkToSelection);
