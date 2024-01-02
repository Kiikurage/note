import { Command } from '../../core/common/Command';
import { CommandService } from '../../core/common/CommandService';
import { ClipboardService } from '../common/ClipboardService';

export const ClipboardPaste = Command.define('clipboard.paste');

CommandService.registerCommand(ClipboardPaste, (command, container) => {
    container.get(ClipboardService.ServiceKey).paste();
});
