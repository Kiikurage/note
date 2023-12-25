import { singleton } from '../lib';
import { Logger } from '../lib/logger';

export interface ICommandService {
    registerCommandHandler(name: string, handler: () => void): this;

    hasCommand(name: string): boolean;

    execCommand(actionName: string): void;
}

class CommandService implements ICommandService {
    private readonly commands = new Map<string, () => void>();

    registerCommandHandler(name: string, handler: () => void): this {
        this.commands.set(name, handler);
        return this;
    }

    hasCommand(name: string): boolean {
        return this.commands.has(name);
    }

    execCommand(name: string) {
        const handler = this.commands.get(name);
        if (handler === undefined) {
            logger.warn(`Unknown command: ${name}`);
            return;
        }

        handler();
    }
}

const logger = new Logger(CommandService.name);
export const getCommandService = singleton(() => new CommandService());
