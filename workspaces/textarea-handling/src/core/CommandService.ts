import { singleton } from '../lib';
import { Logger } from '../lib/logger';

export interface ICommandService {
    register(name: string, action: () => void): this;

    has(name: string): boolean;

    exec(actionName: string): void;
}

class CommandService implements ICommandService {
    private readonly commands = new Map<string, () => void>();

    register(name: string, action: () => void): this {
        this.commands.set(name, action);
        return this;
    }

    has(name: string): boolean {
        return this.commands.has(name);
    }

    exec(command: string) {
        const callback = this.commands.get(command);
        if (callback === undefined) {
            logger.warn(`Unknown command: ${command}`);
            return;
        }

        callback();
    }
}

const logger = new Logger(CommandService.name);
export const getCommandService = singleton(() => new CommandService());
