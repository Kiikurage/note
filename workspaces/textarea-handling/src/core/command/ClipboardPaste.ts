import { Command } from '../Command';
import { CommandService } from '../CommandService';
import { OnMemoryClipboard } from '../OnMemoryClipboard';
import { insertNodes } from '../operator/insertNodes';

export const ClipboardPaste = Command.define('clipboard.paste');

CommandService.registerCommand(ClipboardPaste, async (command, editor) => {
    const clipboardData = await editor.getComponent(OnMemoryClipboard.ComponentKey).read();

    editor.updateState((state) => insertNodes(state, clipboardData));
});
