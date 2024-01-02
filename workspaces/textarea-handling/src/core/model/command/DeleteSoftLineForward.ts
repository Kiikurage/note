import { Command } from '../Command';
import { CommandService } from '../CommandService';
import { Logger } from '../../../lib/logger';
import { DeleteHardLineForward } from './DeleteHardLineForward';

export const DeleteSoftLineForward = Command.define('contenteditable.deleteSoftLineForward');

CommandService.registerCommand(DeleteSoftLineForward, (command, container) => {
    logger.warn('deleteSoftLineForward is not supported, use deleteHardLineForward instead');

    container.get(CommandService.ServiceKey).exec(DeleteHardLineForward());
});

const logger = new Logger('DeleteSoftLineForward');
