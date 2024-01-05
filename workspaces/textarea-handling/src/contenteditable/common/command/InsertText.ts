import { Command } from '../../../core/common/Command';
import { CommandService } from '../../../core/common/CommandService';
import { Editor } from '../../../core/common/core/Editor';
import { assert } from '../../../lib';
import { TextNode } from '../../../core/common/node/TextNode';
import { ParagraphNode } from '../../../core/common/node/ParagraphNode';
import { Logger } from '../../../lib/logger';

export const InsertText = Command.define('contenteditable.insertText').withParams<{ text: string }>();

CommandService.registerCommand(InsertText, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => {
        assert(state.cursor.collapsed, 'state.cursor.collapsed must be true');

        const node = state.root.getByPath(state.cursor.focus.path);
        assert(node !== null, 'node !== null');

        if (node instanceof TextNode) {
            return state.copy({
                root: state.root.replaceByPath(
                    state.cursor.focus.path,
                    node.insertText(state.cursor.focus.offset, command.text),
                ),
                cursor: state.cursor.copy({
                    focus: state.cursor.focus.copy({
                        offset: state.cursor.focus.offset + command.text.length,
                    }),
                    anchor: state.cursor.anchor.copy({
                        offset: state.cursor.anchor.offset + command.text.length,
                    }),
                }),
            });
        }

        if (node instanceof ParagraphNode) {
            const textNode = new TextNode({ text: command.text });

            return state.copy({
                root: state.root.insertByPosition(state.cursor.focus, textNode),
                cursor: state.cursor.copy({
                    focus: state.cursor.focus.copy({
                        path: state.cursor.focus.path.child(textNode.id),
                        offset: command.text.length,
                    }),
                    anchor: state.cursor.anchor.copy({
                        path: state.cursor.anchor.path.child(textNode.id),
                        offset: command.text.length,
                    }),
                }),
            });
        }

        const textNode = new TextNode({ text: command.text });
        const paragraph = new ParagraphNode({}, [textNode]);

        return state.copy({
            root: state.root.insertByPosition(state.cursor.focus, paragraph),
            cursor: state.cursor.copy({
                focus: state.cursor.focus.copy({
                    path: state.cursor.focus.path.child(paragraph.id).child(textNode.id),
                    offset: command.text.length,
                }),
                anchor: state.cursor.anchor.copy({
                    path: state.cursor.anchor.path.child(paragraph.id).child(textNode.id),
                    offset: command.text.length,
                }),
            }),
        });
    });
});

const logger = Logger.of(InsertText);
