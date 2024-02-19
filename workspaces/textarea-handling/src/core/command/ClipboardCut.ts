import { Command } from '../Command';
import { CommandService } from '../CommandService';
import { collapsed, getCursorFrom, getCursorTo } from '../Cursor';
import { OnMemoryClipboard } from '../OnMemoryClipboard';
import { cloneTreeInRange } from '../operator/cloneTreeInRange';
import { deleteSelectedRange } from '../operator/deleteSelectedRange';

export const ClipboardCut = Command.define('clipboard.cut');

CommandService.registerCommand(ClipboardCut, async (command, editor) => {
    if (collapsed(editor.state.cursor)) return;

    await editor
        .getComponent(OnMemoryClipboard.ComponentKey)
        .write(cloneTreeInRange(getCursorFrom(editor.state.cursor), getCursorTo(editor.state.cursor)));

    editor.updateState(deleteSelectedRange);
});
