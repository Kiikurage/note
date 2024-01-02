export interface ICommand {
    type: string;
}

export type Command<T extends string, P> = ICommand & { type: T } & P;

export module Command {
    export function define<T extends string>(type: T): CommandFactory<T, void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const commandCreator = (params: any) => ({ ...params, type });
        commandCreator.toString = () => `CommandFactory(${type})`;
        commandCreator.type = type;
        commandCreator.withParams = <P>(): CommandFactory<T, P> => {
            return commandCreator as never as CommandFactory<T, P>;
        };
        commandCreator.isInstance = (command: ICommand) => command.type === type;

        return commandCreator as CommandFactory<T, void>;
    }
}

export interface CommandFactory<T extends string, P> {
    type: T;
    (params: P): { type: T } & P;
    withParams<P2>(): CommandFactory<T, P2>;
    isInstance(command: ICommand): command is Command<T, P>;
}

export type CommandTypeOf<CF> = CF extends CommandFactory<infer T, infer P> ? Command<T, P> : never;
