import { Command } from '../Command';
import { CommandService } from '../CommandService';
import { Logger } from '../../../lib/logger';
import { DeleteHardLineBackward } from './DeleteHardLineBackward';

export const DeleteSoftLineBackward = Command.define('contenteditable.deleteSoftLineBackward');

CommandService.registerCommand(DeleteSoftLineBackward, (command, container) => {
    logger.warn('deleteSoftLineBackward is not supported, use deleteHardLineBackward instead');

    container.get(CommandService.ServiceKey).exec(DeleteHardLineBackward());
});

const logger = new Logger('DeleteSoftLineBackward');
