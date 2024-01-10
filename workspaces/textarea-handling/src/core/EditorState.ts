import { dataclass } from '../lib';
import { Logger } from '../lib/logger';
import { Cursor } from './Cursor';
import { Doc } from './Doc';

export class EditorState extends dataclass<{
    doc: Doc;
    cursor: Cursor;
}>() {
    static create() {
        const doc = Doc.empty();

        return new EditorState({
            doc,
            cursor: Cursor.of(doc.root.id),
        });
    }
}

const logger = Logger.of(EditorState);
