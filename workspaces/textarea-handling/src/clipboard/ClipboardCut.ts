import { Command } from '../command/Command';
import { CommandService } from '../command/CommandService';
import { ClipboardService } from './ClipboardService';

export const ClipboardCut = Command.define('clipboard.cut');

CommandService.registerCommand(ClipboardCut, (command, container) => {
    container.get(ClipboardService.ServiceKey).cut();
});
