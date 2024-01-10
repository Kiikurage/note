import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { Editor } from '../../../core/Editor';
import { deleteSelectedRange } from '../../../core/mutation/deleteAndMerge';
import { EditorState } from '../../../core/EditorState';
import { ParagraphNode } from '../../../core/node/ParagraphNode';
import { Position } from '../../../core/Position';
import { splitRecursively } from '../../../core/mutation/split';
import { Cursor } from '../../../core/Cursor';

export const InsertParagraph = Command.define('contenteditable.insertParagraph');

CommandService.registerCommand(InsertParagraph, (command, container) => {
    container.get(Editor.ServiceKey).updateState(insertParagraph);
});

export function insertParagraph(state: EditorState): EditorState {
    if (!state.cursor.collapsed) return insertParagraph(deleteSelectedRange(state));

    let doc = state.doc;
    const caret = state.cursor.focus;
    const paragraphId = doc.findAncestor(caret.nodeId, (node) => node instanceof ParagraphNode);
    if (paragraphId !== null) {
        doc = splitRecursively(doc, paragraphId, caret);

        let newNodeId = doc.nextSiblingNodeId(paragraphId);
        do {
            const firstChildId = doc.firstChildIdOrNull(newNodeId);
            if (firstChildId === null) break;
            newNodeId = firstChildId;
        } while (newNodeId !== null);
        return state.copy({ doc, cursor: Cursor.of(newNodeId, 0) });
    }

    const paragraph = new ParagraphNode({});
    doc = doc.insert(caret, paragraph);
    return state.copy({ doc, cursor: Cursor.of(Position.of(paragraph.id, 0)) });
}
