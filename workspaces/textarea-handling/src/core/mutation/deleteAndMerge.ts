import { Logger } from '../../lib/logger';
import { Position } from '../Position';
import { Doc } from '../Doc';
import { EditorState } from '../EditorState';
import { Cursor } from '../Cursor';
import { assert } from '../../lib';
import { merge } from './merge';
import { deleteByRange } from './deleteByRange';

export function deleteSelectedRange(state: EditorState): EditorState {
    if (state.cursor.collapsed) return state;

    const [from, to] = state.cursor.getRange(state.doc);
    const result = deleteAndMerge(state.doc, from, to);

    return state.copy({ doc: result.doc, cursor: Cursor.of(result.from, result.to) });
}

/**
 * Delete contents in a given range. After deletion, former and latter parts are merged.
 */
export function deleteAndMerge(doc: Doc, from: Position, to: Position): DeleteByRangeResult {
    doc = deleteByRange(doc, from, to);

    // Merge
    to = from.nodeId === to.nodeId ? from : Position.of(to.nodeId, 0);

    const fromFullPath = doc.getFullPath(from.nodeId);
    const toFullPath = doc.getFullPath(to.nodeId);

    while (fromFullPath.length > 0 && toFullPath.length > 0) {
        const fromNodeId = fromFullPath.shift();
        const toNodeId = toFullPath.shift();
        assert(fromNodeId !== undefined, 'fromNodeId is undefined');
        assert(toNodeId !== undefined, 'toNodeId is undefined');
        if (fromNodeId === toNodeId) continue;

        const newDoc = merge(doc, doc.startPosition(toNodeId));
        if (newDoc === doc) break;
        doc = newDoc;

        if (toNodeId === to.nodeId) to = from;
    }

    return { doc, from, to };
}

export interface DeleteByRangeResult {
    doc: Doc;
    from: Position;
    to: Position;
}

const logger = Logger.of(deleteAndMerge);
