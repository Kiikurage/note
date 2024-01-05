import { assert } from '../../../lib';
import { TextNode } from '../../../core/common/node/TextNode';
import { CommandService } from '../../../core/common/CommandService';
import { Command } from '../../../core/common/Command';
import { Editor } from '../../../core/common/core/Editor';
import { RootNode } from '../../../core/common/node/RootNode';
import { Logger } from '../../../lib/logger';
import { EditorState } from '../../../core/common/core/EditorState';
import { Cursor } from '../../../core/common/core/Cursor';

export const DeleteContentBackward = Command.define('contenteditable.deleteContentBackward');

CommandService.registerCommand(DeleteContentBackward, (command, container) => {
    container.get(Editor.ServiceKey).updateState(deleteContentBackward);
});

export function deleteContentBackward(state: EditorState) {
    assert(state.cursor.collapsed, 'Cursor must be collapsed');

    const caret = state.cursor.focus;

    const node = state.root.getByPath(caret.path);
    assert(node !== null, 'node must not be null');

    if (caret.offset === 0) {
        if (node instanceof RootNode) return state;
        if (node instanceof TextNode && node.length !== 0) {
            logger.undefined('behavior is undefined: DeleteContentBackward at the head of TextNode having contents');
            return state;
        }

        const path = caret.path.parent();
        const parent = state.root.getByPath(path);
        assert(parent !== null, 'parent must not be null');

        const offset = parent.children.findIndex((child) => child.id === node.id);
        assert(offset !== -1, 'offset must not be -1');

        return state.copy({
            root: state.root.deleteByPath(caret.path),
            cursor: Cursor.of(path, offset),
        });
    } else {
        if (node instanceof TextNode && node.length === 1) {
            const path = caret.path.parent();
            const parent = state.root.getByPath(path);
            assert(parent !== null, 'parent must not be null');

            const offset = parent.children?.indexOf(node);
            assert(offset !== -1, 'offset must not be -1');

            return state.copy({
                root: state.root.deleteByPath(caret.path),
                cursor: Cursor.of(path, offset),
            });
        }

        return state.copy({
            root: state.root.deleteByPosition(caret.copy({ offset: caret.offset - 1 })),
            cursor: Cursor.of(caret.path, caret.offset - 1),
        });
    }
}

const logger = Logger.of(DeleteContentBackward);
