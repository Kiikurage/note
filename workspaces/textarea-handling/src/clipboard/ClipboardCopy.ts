import { Command } from '../command/Command';
import { CommandService } from '../command/CommandService';
import { ClipboardService } from './ClipboardService';

export const ClipboardCopy = Command.define('clipboard.copy');

CommandService.registerCommand(ClipboardCopy, (command, container) => {
    container.get(ClipboardService.ServiceKey).copy();
});
