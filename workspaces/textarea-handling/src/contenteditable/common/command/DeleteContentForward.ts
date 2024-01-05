import { Command } from '../../../core/common/Command';
import { CommandService } from '../../../core/common/CommandService';
import { assert } from '../../../lib';
import { TextNode } from '../../../core/common/node/TextNode';
import { Editor } from '../../../core/common/core/Editor';
import { ContainerNode } from '../../../core/common/node/ContainerNode';
import { RootNode } from '../../../core/common/node/RootNode';
import { Logger } from '../../../lib/logger';

export const DeleteContentForward = Command.define('contenteditable.deleteContentForward');

CommandService.registerCommand(DeleteContentForward, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => {
        assert(state.cursor.collapsed, 'Cursor must be collapsed');

        const { path: caretPath, offset: caretOffset } = state.cursor.focus;

        const node = state.root.getByPath(caretPath);
        if (node instanceof ContainerNode) {
            if (caretOffset === node.children.length) {
                logger.warn('behavior is undefined: DeleteContentForward at the last of ContainerNode');
            } else {
                return state.copy({
                    root: state.root.deleteByPath(caretPath.child(node.children[caretOffset].id)),
                });
            }
        }

        if (node instanceof TextNode && caretOffset < node.text.length) {
            if (node.text.length === 1) {
                const path = state.cursor.anchor.path.parent();
                const parent = state.root.getByPath(path);
                assert(parent !== null, 'parent must not be null');

                const offset = parent.children?.indexOf(node);
                assert(offset !== -1, 'caretOffset must not be -1');

                return state.copy({
                    root: state.root.deleteByPath(state.cursor.anchor.path),
                    cursor: state.cursor.copy({
                        anchor: state.cursor.anchor.copy({ path, offset }),
                        focus: state.cursor.focus.copy({ path, offset }),
                    }),
                });
            }

            return state.copy({
                root: state.root.replaceByPath(
                    state.cursor.anchor.path,
                    node.setText(node.text.substring(0, caretOffset) + node.text.substring(caretOffset + 1)),
                ),
            });
        }

        return state;
    });
});

const logger = Logger.of(DeleteContentForward);
