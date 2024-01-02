import { assert, Disposable } from '../../lib';
import { Logger } from '../../lib/logger';
import { Command, CommandFactory, ICommand } from './Command';
import { DIContainer } from './DIContainer';

class CommandMap extends Disposable {
    static readonly default = new CommandMap();
    protected readonly handlers = new Map<string, (command: ICommand, container: DIContainer) => void>();

    registerCommand<T extends string, P>(
        commandFactory: CommandFactory<T, P>,
        handler: (command: Command<T, P>, container: DIContainer) => void,
    ) {
        this.handlers.set(commandFactory.type, (command, container) => {
            assert(
                commandFactory.isInstance(command),
                `Command type mismatch: command:${command.type} !== handler:${commandFactory.type}`,
            );
            handler(command, container);
        });
    }

    dispose() {
        this.handlers.clear();
    }

    get(type: string): ((command: ICommand, container: DIContainer) => void) | undefined {
        return this.handlers.get(type) ?? (this !== CommandMap.default ? CommandMap.default.get(type) : undefined);
    }
}

export class CommandService extends Disposable {
    static readonly ServiceKey = DIContainer.register((container) => new CommandService(container));

    private readonly handlers = new CommandMap();

    constructor(protected readonly container: DIContainer) {
        super();
    }

    registerCommand<T extends string, P>(
        commandFactory: CommandFactory<T, P>,
        handler: (command: Command<T, P>, container: DIContainer) => void,
    ) {
        this.handlers.registerCommand(commandFactory, handler);

        return this;
    }

    static registerCommand<T extends string, P>(
        commandFactory: CommandFactory<T, P>,
        handler: (command: Command<T, P>, container: DIContainer) => void,
    ) {
        CommandMap.default.registerCommand(commandFactory, handler);
    }

    dispose() {
        this.handlers.dispose();
    }

    exec(command: ICommand) {
        const handler = this.handlers.get(command.type);
        if (handler === undefined) {
            logger.warn(`Unknown command: ${command.type}`);
            return;
        }

        handler(command, this.container);
    }
}

const logger = new Logger(CommandService.name);
