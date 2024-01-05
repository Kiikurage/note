import { assert } from '../../../lib';
import { TextNode } from '../../../core/common/node/TextNode';
import { ParagraphNode } from '../../../core/common/node/ParagraphNode';
import { Logger } from '../../../lib/logger';
import { Cursor } from '../../../core/common/core/Cursor';
import { EditorState } from '../../../core/common/core/EditorState';

export function insertText(state: EditorState, text: string) {
    assert(state.cursor.collapsed, 'state.cursor.collapsed must be true');

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
