import { Logger } from '../lib/logger';
import { Cursor } from './Cursor';
import { Position } from './Position';
import { Doc } from './interfaces';
import { createDoc } from './createDoc';
import { dataclass } from '../lib/dataclass';

export class EditorState extends dataclass<{
    doc: Doc;
    cursor: Cursor;
}>() {
    static create() {
        const doc = createDoc();

        return new EditorState({
            doc,
            cursor: Cursor.of(doc.root.id),
        });
    }

    setCursor(cursor: Cursor) {
        if (cursor.anchor.equals(this.cursor.anchor) && cursor.focus.equals(this.cursor.focus)) return this;

        return this.copy({ cursor });
    }

    insertText(text: string): EditorState {
        if (!this.cursor.collapsed) return this.deleteSelectedRange().insertText(text);

        const { doc, to } = this.doc.get(this.cursor.focus.nodeId).insertText(this.doc, this.cursor.focus.offset, text);

        return this.copy({ doc, cursor: Cursor.of(to) });
    }

    insertParagraph(): EditorState {
        if (!this.cursor.collapsed) return this.deleteSelectedRange().insertParagraph();

        const result = this.doc.get(this.cursor.focus.nodeId).insertParagraph(this.doc, this.cursor.focus.offset);
        if (result.nodeId === null) return this;

        return this.copy({ doc: result.doc, cursor: Cursor.of(Position.of(result.nodeId, 0)) });
    }

    deleteContentBackward() {
        if (!this.cursor.collapsed) return this.deleteSelectedRange();

        const { doc, from, to } = this.doc
            .get(this.cursor.focus.nodeId)
            .deleteContentBackward(this.doc, this.cursor.focus.offset);
        if (doc === this.doc) return this;

        return this.copy({ doc, cursor: Cursor.of(from, to) });
    }

    deleteContentForward(): EditorState {
        if (!this.cursor.collapsed) return this.deleteSelectedRange();

        const { doc, from, to } = this.doc
            .get(this.cursor.focus.nodeId)
            .deleteContentForward(this.doc, this.cursor.focus.offset);
        if (doc === this.doc) return this;

        return this.copy({ doc, cursor: Cursor.of(from, to) });
    }

    deleteSelectedRange(): EditorState {
        if (this.cursor.collapsed) return this;

        const range = this.cursor.getRange(this.doc);

        let { doc, from, to } = this.doc.deleteByRange(range.from, range.to);

        const fromFullPath = doc.getFullPath(from.nodeId);
        const toFullPath = doc.getFullPath(to.nodeId);

        while (fromFullPath.length > 0 && toFullPath.length > 0) {
            if (fromFullPath[0] === toFullPath[0]) {
                fromFullPath.shift();
                toFullPath.shift();
                continue;
            }

            const result = doc.get(fromFullPath[0]).merge(doc);
            if (result.position !== null) {
                doc = result.doc;
                from = result.position;
            }
            break;
        }

        // subtrees are completely merged, thus to position must be same as from position.
        if (doc.getOrNull(to.nodeId) === null) {
            to = from;
        }
        return this.copy({ doc, cursor: Cursor.of(from, to) });
    }
}

const logger = Logger.of(EditorState);
