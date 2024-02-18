import { Logger } from '../lib/logger';
import { Command, CommandFactory, ICommand } from './Command';
import { assert } from '../lib/assert';
import { Editor, defineComponent } from './Editor';

class CommandMap {
    static readonly default = new CommandMap();
    protected readonly handlers = new Map<string, (command: ICommand, editor: Editor) => void | Promise<void>>();

    registerCommand<T extends string, P>(
        commandFactory: CommandFactory<T, P>,
        handler: (command: Command<T, P>, editor: Editor) => void | Promise<void>,
    ) {
        this.handlers.set(commandFactory.type, (command, editor) => {
            assert(
                commandFactory.isInstance(command),
                `Command type mismatch: command:${command.type} !== handler:${commandFactory.type}`,
            );
            handler(command, editor);
        });
    }

    get(type: string): ((command: ICommand, editor: Editor) => void | Promise<void>) | undefined {
        return this.handlers.get(type) ?? (this !== CommandMap.default ? CommandMap.default.get(type) : undefined);
    }
}

export class CommandService {
    static readonly ComponentKey = defineComponent((editor) => new CommandService(editor));

    private readonly handlers = new CommandMap();

    constructor(protected readonly editor: Editor) {}

    registerCommand<T extends string, P>(
        commandFactory: CommandFactory<T, P>,
        handler: (command: Command<T, P>, editor: Editor) => void,
    ) {
        this.handlers.registerCommand(commandFactory, handler);

        return this;
    }

    static registerCommand<T extends string, P>(
        commandFactory: CommandFactory<T, P>,
        editor: (command: Command<T, P>, editor: Editor) => void,
    ) {
        CommandMap.default.registerCommand(commandFactory, editor);
    }

    exec(command: ICommand) {
        const handler = this.handlers.get(command.type);
        if (handler === undefined) {
            logger.warn(`Unknown command: ${command.type}`);
            return;
        }

        return handler(command, this.editor);
    }
}

const logger = new Logger(CommandService.name);
