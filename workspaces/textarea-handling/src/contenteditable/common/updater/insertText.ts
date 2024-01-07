import { assert } from '../../../lib';
import { TextNode } from '../../../core/common/TextNode';
import { ParagraphNode } from '../../../core/common/ParagraphNode';
import { Logger } from '../../../lib/logger';
import { Cursor } from '../../../core/common/Cursor';
import { EditorState } from '../../../core/common/EditorState';
import { deleteSelectedRange } from './deleteSelectedRange';

export function insertText(state: EditorState, text: string) {
    if (!state.cursor.collapsed) state = deleteSelectedRange(state);

    const caret = state.cursor.focus;

    const node = state.root.getByPath(caret.path);
    assert(node !== null, 'node !== null');

    if (node instanceof TextNode) {
        return state.copy({
            root: state.root.replaceByPath(caret.path, node.insertText(caret.offset, text)),
            cursor: Cursor.of(caret.path, caret.offset + text.length),
        });
    }

    if (node instanceof ParagraphNode) {
        const textNode = new TextNode({ text });

        return state.copy({
            root: state.root.insertByPosition(caret, textNode),
            cursor: Cursor.of(caret.path.child(textNode.id), text.length),
        });
    }

    const textNode = new TextNode({ text });
    const paragraph = new ParagraphNode({}, [textNode]);

    return state.copy({
        root: state.root.insertByPosition(caret, paragraph),
        cursor: Cursor.of(caret.path.child(paragraph.id).child(textNode.id), text.length),
    });
}

const logger = Logger.of(insertText);
