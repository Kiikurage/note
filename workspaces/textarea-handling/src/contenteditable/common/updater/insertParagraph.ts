import { assert } from '../../../lib';
import { ParagraphNode } from '../../../core/common/node/ParagraphNode';
import { Logger } from '../../../lib/logger';
import { Cursor } from '../../../core/common/core/Cursor';
import { EditorState } from '../../../core/common/core/EditorState';
import { Position } from '../../../core/common/core/Position';
import { Path } from '../../../core/common/core/Path';
import { splitNodeByCursor } from './splitContainerByCursor';
import { deleteSelectedRange } from './deleteSelectedRange';

export function insertParagraph(state: EditorState) {
    if (!state.cursor.collapsed) state = deleteSelectedRange(state);

    const containerPath = state.root.findAncestor(state.cursor.focus.path, (node) => node.isContainer);
    if (containerPath !== null && !containerPath.isRoot) return splitNodeByCursor(state, containerPath);

    const paragraph = new ParagraphNode({});

    return state.copy({
        root: state.root.insertByPosition(Position.of(Path.of(), state.root.length), paragraph),
        cursor: Cursor.of(Path.of(paragraph.id)),
    });
}

const logger = Logger.of(insertParagraph);
