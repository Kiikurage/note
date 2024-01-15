import { EditorState } from '../core/EditorState';
import { LinkNode } from './LinkNode';
import { Position } from '../core/Position';
import { Logger } from '../lib/logger';
import { Cursor } from '../core/Cursor';
import { Doc } from '../core/interfaces';
import { assert } from '../lib/assert';
import { wrapContents } from './wrapContents';
import { unwrapNode } from './unwrapNode';

export function toggleLinkAtSelection(state: EditorState) {
    if (state.cursor.collapsed) return state;

    const { from, to } = state.cursor.getRange(state.doc);
    if (from.nodeId !== to.nodeId) {
        logger.warn('Toggle link with multiple nodes are not supported yet.');
        return state;
    }

    const { doc, from: newFrom, to: newTo } = toggleLinkCore(state.doc, from, to);

    return state.copy({ doc, cursor: Cursor.of(newFrom, newTo) });
}

function toggleLinkCore(doc: Doc, from: Position, to: Position): InsertLinkResult {
    assert(from.nodeId === to.nodeId, 'from.path === to.path');

    const ancestorLink = doc.findAncestor(from.nodeId, (node) => node instanceof LinkNode);
    if (ancestorLink === null) {
        return wrapContents(doc, from, to, new LinkNode({ href: 'https://example.com' }));
    } else {
        doc = ancestorLink.split(doc, to).doc;
        const splitResult = ancestorLink.split(doc, from);
        doc = splitResult.doc;

        const link = splitResult.right ?? splitResult.left;
        assert(link !== null, 'link !== null');

        return unwrapNode(doc, link.id);
    }
}

interface InsertLinkResult {
    doc: Doc;
    from: Position;
    to: Position;
}

const logger = Logger.of(toggleLinkAtSelection);
