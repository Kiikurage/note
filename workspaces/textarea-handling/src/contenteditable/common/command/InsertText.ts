import { Command } from '../../../core/common/Command';
import { CommandService } from '../../../core/common/CommandService';
import { Editor } from '../../../core/common/core/Editor';
import { assert } from '../../../lib';
import { TextNode } from '../../../core/common/node/TextNode';
import { ParagraphNode } from '../../../core/common/node/ParagraphNode';
import { Logger } from '../../../lib/logger';
import { Cursor } from '../../../core/common/core/Cursor';

export const InsertText = Command.define('contenteditable.insertText').withParams<{ text: string }>();

CommandService.registerCommand(InsertText, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => {
        assert(state.cursor.collapsed, 'state.cursor.collapsed must be true');

        const caret = state.cursor.focus;

        const node = state.root.getByPath(caret.path);
        assert(node !== null, 'node !== null');

        if (node instanceof TextNode) {
            return state.copy({
                root: state.root.replaceByPath(caret.path, node.insertText(caret.offset, command.text)),
                cursor: Cursor.of(caret.path, caret.offset + command.text.length),
            });
        }

        if (node instanceof ParagraphNode) {
            const textNode = new TextNode({ text: command.text });

            return state.copy({
                root: state.root.insertByPosition(caret, textNode),
                cursor: Cursor.of(caret.path.child(textNode.id), command.text.length),
            });
        }

        const textNode = new TextNode({ text: command.text });
        const paragraph = new ParagraphNode({}, [textNode]);

        return state.copy({
            root: state.root.insertByPosition(caret, paragraph),
            cursor: Cursor.of(caret.path.child(paragraph.id).child(textNode.id), command.text.length),
        });
    });
});

const logger = Logger.of(InsertText);
