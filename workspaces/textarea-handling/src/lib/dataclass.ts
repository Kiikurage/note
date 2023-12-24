export function dataclass<OwnProps extends Record<string, unknown>>() {
    class Dataclass {
        constructor(props: OwnProps) {
            Object.assign(this, props);
            this.init(props);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        protected init(props: OwnProps) {}

        copy(props: Partial<OwnProps> = {}): this {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new (this as any).constructor({ ...this, ...props });
        }
    }

    return Dataclass as never as {
        new (props: OwnProps): Dataclass & Readonly<OwnProps>;
    };
}
