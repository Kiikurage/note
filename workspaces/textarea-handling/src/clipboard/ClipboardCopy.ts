import { Command } from '../core/common/Command';
import { CommandService } from '../core/common/CommandService';
import { ClipboardService } from './ClipboardService';

export const ClipboardCopy = Command.define('clipboard.copy');

CommandService.registerCommand(ClipboardCopy, (command, container) => {
    container.get(ClipboardService.ServiceKey).copy();
});
