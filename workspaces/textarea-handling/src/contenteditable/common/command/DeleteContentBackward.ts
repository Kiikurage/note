import { assert } from '../../../lib';
import { TextNode } from '../../../core/common/node/TextNode';
import { CommandService } from '../../../core/common/CommandService';
import { Command } from '../../../core/common/Command';
import { Editor } from '../../../core/common/core/Editor';
import { ContainerNode } from '../../../core/common/node/ContainerNode';
import { RootNode } from '../../../core/common/node/RootNode';

export const DeleteContentBackward = Command.define('contenteditable.deleteContentBackward');

CommandService.registerCommand(DeleteContentBackward, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => {
        assert(state.cursor.collapsed, 'Cursor must be collapsed');

        const { path: caretPath, offset: caretOffset } = state.cursor.focus;

        const node = state.root.getByPath(caretPath);
        if (node instanceof ContainerNode) {
            if (state.cursor.focus.offset === 0) {
                if (node instanceof RootNode) return state;

                const path = caretPath.parent();
                const parent = state.root.getByPath(path);
                assert(parent !== null, 'parent must not be null');

                const offset = parent.children.findIndex((child) => child.id === node.id);
                assert(offset !== -1, 'offsetInParent must not be -1');

                return state.copy({
                    root: state.root.deleteByPath(caretPath),
                    cursor: state.cursor.copy({
                        anchor: state.cursor.anchor.copy({ path, offset }),
                        focus: state.cursor.focus.copy({ path, offset }),
                    }),
                });
            } else {
                return state.copy({
                    root: state.root.deleteByPath(caretPath.child(node.children[caretOffset].id)),
                    cursor: state.cursor.copy({
                        anchor: state.cursor.anchor.copy({ offset: caretOffset - 1 }),
                        focus: state.cursor.focus.copy({ offset: caretOffset - 1 }),
                    }),
                });
            }
        }

        if (node instanceof TextNode && state.cursor.anchor.offset > 0) {
            if (node.text.length === 1) {
                const path = caretPath.parent();
                const parent = state.root.getByPath(path);
                assert(parent !== null, 'parent must not be null');

                const offset = parent.children?.indexOf(node);
                assert(offset !== -1, 'offset must not be -1');

                return state.copy({
                    root: state.root.deleteByPath(caretPath),
                    cursor: state.cursor.copy({
                        anchor: state.cursor.anchor.copy({ path, offset }),
                        focus: state.cursor.focus.copy({ path, offset }),
                    }),
                });
            }

            return state.copy({
                root: state.root.replaceByPath(
                    caretPath,
                    node.setText(
                        node.text.substring(0, state.cursor.anchor.offset - 1) +
                            node.text.substring(state.cursor.anchor.offset),
                    ),
                ),
                cursor: state.cursor.copy({
                    anchor: state.cursor.anchor.copy({ offset: state.cursor.anchor.offset - 1 }),
                    focus: state.cursor.focus.copy({ offset: state.cursor.focus.offset - 1 }),
                }),
            });
        }

        return state;
    });
});
