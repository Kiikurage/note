import { EditorState } from '../core/EditorState';
import { InlineCodeNode } from './InlineCodeNode';
import { Position } from '../core/Position';
import { Logger } from '../lib/logger';
import { Cursor } from '../core/Cursor';
import { Doc } from '../core/interfaces';
import { assert } from '../lib/assert';
import { wrapContents } from './wrapContents';
import { unwrapNode } from './unwrapNode';

export function toggleCodeAtSelection(state: EditorState) {
    if (state.cursor.collapsed) return state;

    const { from, to } = state.cursor.getRange(state.doc);
    if (from.nodeId !== to.nodeId) {
        logger.warn('Toggle code with multiple nodes are not supported yet.');
        return state;
    }

    const { doc, from: newFrom, to: newTo } = toggleCodeCore(state.doc, from, to);

    return state.copy({ doc, cursor: Cursor.of(newFrom, newTo) });
}

function toggleCodeCore(doc: Doc, from: Position, to: Position): InsertCodeResult {
    assert(from.nodeId === to.nodeId, 'from.path === to.path');

    const ancestorCode = doc.findAncestor(from.nodeId, (node) => node instanceof InlineCodeNode);
    if (ancestorCode === null) {
        return wrapContents(doc, from, to, new InlineCodeNode());
    } else {
        doc = ancestorCode.split(doc, to).doc;
        const splitResult = ancestorCode.split(doc, from);
        doc = splitResult.doc;

        const code = splitResult.right ?? splitResult.left;
        assert(code !== null, 'code !== null');

        return unwrapNode(doc, code.id);
    }
}

interface InsertCodeResult {
    doc: Doc;
    from: Position;
    to: Position;
}

const logger = Logger.of(toggleCodeAtSelection);
