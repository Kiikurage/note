import { Command } from '../core/common/Command';
import { CommandService } from '../core/common/CommandService';
import { ClipboardService } from './ClipboardService';

export const ClipboardCut = Command.define('clipboard.cut');

CommandService.registerCommand(ClipboardCut, (command, container) => {
    container.get(ClipboardService.ServiceKey).cut();
});
