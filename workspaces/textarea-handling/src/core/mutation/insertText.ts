import { Logger } from '../../lib/logger';
import { Position } from '../Position';
import { Doc } from '../Doc';
import { TextNode } from '../node/TextNode';
import { ParagraphNode } from '../node/ParagraphNode';
import { EditorState } from '../EditorState';
import { Cursor } from '../Cursor';
import { deleteSelectedRange } from './deleteAndMerge';

export function insertText(state: EditorState, text: string): EditorState {
    if (!state.cursor.collapsed) return insertText(deleteSelectedRange(state), text);

    const { doc, positionFrom, positionTo } = insertTextAt(state.doc, state.cursor.focus, text);

    return state.copy({ doc, cursor: Cursor.of(positionTo) });
}

/**
 * Insert text.
 *
 * - If the given position is a TextNode, insert text into that text node.
 * - If the given position is after TextNode, insert text at the beginning of that text node.
 * - If the given position is before TextNode, insert text at the end of that text node.
 * - If the given position is descendant of a ParagraphNode, insert TextNode into that ParagraphNode and insert text there.
 * - otherwise, insert ParagraphNode and TextNode into the given position, and insert text there.
 */
export function insertTextAt(doc: Doc, position: Position, text: string): InsertTextResult {
    const node = doc.get(position.nodeId);

    if (node instanceof TextNode) {
        doc = doc.replace(node.id, node.insertText(position.offset, text));
        return { doc, positionFrom: position, positionTo: position.next(text.length) };
    }

    const next = doc.getByPositionOrNull(position);
    if (next !== null && next instanceof TextNode) {
        doc = doc.replace(next.id, next.insertText(0, text));
        return { doc, positionFrom: Position.of(next.id, 0), positionTo: Position.of(next.id, text.length) };
    }

    const prev = doc.prevPositionNodeOrNull(position);
    if (prev !== null && prev instanceof TextNode) {
        doc = doc.replace(prev.id, prev.insertText(prev.length, text));
        return {
            doc,
            positionFrom: Position.of(prev.id, prev.length),
            positionTo: Position.of(prev.id, prev.length + text.length),
        };
    }

    if (doc.findAncestor(position.nodeId, (node) => node instanceof ParagraphNode)) {
        const textNode = new TextNode({ text });

        doc = doc.insertByPosition(position, textNode);

        return { doc, positionFrom: Position.of(textNode.id), positionTo: Position.of(textNode.id, text.length) };
    }

    const paragraph = new ParagraphNode({});
    const textNode = new TextNode({ text });

    doc = doc.insertByPosition(position, paragraph);
    doc = doc.insertFirst(paragraph.id, textNode);

    return { doc, positionFrom: Position.of(textNode.id), positionTo: Position.of(textNode.id, text.length) };
}

export interface InsertTextResult {
    doc: Doc;
    positionFrom: Position;
    positionTo: Position;
}

const logger = Logger.of(insertText);
