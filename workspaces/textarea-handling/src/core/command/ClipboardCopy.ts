import { CommandService } from '../CommandService';
import { Command } from '../Command';
import { cloneTree } from '../operator/cloneTree';
import { DocNode } from '../node/DocNode';
import { insertNodes } from '../operator/insertNodes';
import { deleteSelectedRange } from '../operator/deleteSelectedRange';
import { ClipboardPaste } from './ClipboardPaste';
import { ClipboardCut } from './ClipboardCut';
import { collapsed, getCursorFrom, getCursorTo } from '../Cursor';

export const ClipboardCopy = Command.define('clipboard.copy');
const map = new Map<DocNode, DocNode[]>();

CommandService.registerCommand(ClipboardCopy, (command, editor) => {
    if (collapsed(editor.state.cursor)) return;

    map.set(editor.state.root, cloneTree(getCursorFrom(editor.state.cursor), getCursorTo(editor.state.cursor)));
});

CommandService.registerCommand(ClipboardPaste, (command, editor) => {
    const clipboardData = map.get(editor.state.root) ?? [];
    editor.updateState((state) => insertNodes(state, clipboardData));
});

CommandService.registerCommand(ClipboardCut, (command, editor) => {
    if (collapsed(editor.state.cursor)) return;

    map.set(editor.state.root, cloneTree(getCursorFrom(editor.state.cursor), getCursorTo(editor.state.cursor)));
    editor.updateState(deleteSelectedRange);
});
