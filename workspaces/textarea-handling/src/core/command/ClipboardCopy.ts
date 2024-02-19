import { CommandService } from '../CommandService';
import { Command } from '../Command';
import { collapsed, getCursorFrom, getCursorTo } from '../Cursor';
import { OnMemoryClipboard } from '../OnMemoryClipboard';
import { cloneTreeInRange } from '../operator/cloneTreeInRange';

export const ClipboardCopy = Command.define('clipboard.copy');

CommandService.registerCommand(ClipboardCopy, async (command, editor) => {
    if (collapsed(editor.state.cursor)) return;

    await editor
        .getComponent(OnMemoryClipboard.ComponentKey)
        .write(cloneTreeInRange(getCursorFrom(editor.state.cursor), getCursorTo(editor.state.cursor)));
});
