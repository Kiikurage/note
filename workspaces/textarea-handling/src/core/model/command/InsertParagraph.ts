import { Command } from '../Command';
import { CommandService } from '../CommandService';
import { Logger } from '../../../lib/logger';
import { InsertLineBreak } from './InsertLineBreak';

export const InsertParagraph = Command.define('contenteditable.insertParagraph');

CommandService.registerCommand(InsertParagraph, (command, container) => {
    logger.warn('insertParagraph is not supported, use insertLineBreak instead');

    container.get(CommandService.ServiceKey).exec(InsertLineBreak());
});

const logger = new Logger('InsertLineSoftBreak');
