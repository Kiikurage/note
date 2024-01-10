import { Command } from '../command/Command';
import { CommandService } from '../command/CommandService';
import { ClipboardService } from './ClipboardService';

export const ClipboardPaste = Command.define('clipboard.paste');

CommandService.registerCommand(ClipboardPaste, (command, container) => {
    container.get(ClipboardService.ServiceKey).paste();
});
