import { Logger } from '../lib/logger';
import { counter } from '../lib/counter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeConstructor = new (props: any, id?: number) => Node<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeTypeOf<T extends NodeConstructor> = T extends new (props: any, id: number) => infer R ? R : never;

export type NodeId = number;

export class Node<Props extends Record<string, unknown> = Record<string, unknown>> {
    static readonly generateId = counter();

    constructor(
        readonly props: Props,
        readonly id: NodeId = Node.generateId(),
    ) {}

    static getTypeName(nodeConstructor: NodeConstructor): string {
        if ('displayName' in nodeConstructor && typeof nodeConstructor.displayName === 'string') {
            return nodeConstructor.displayName;
        }

        return nodeConstructor.name;
    }

    get type() {
        return Node.getTypeName(this.constructor as NodeConstructor);
    }

    copy(props: Partial<Props>, id = this.id): this {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new (this as any).constructor({ ...this.props, ...props }, id);
    }
}

const logger = Logger.of(Node);
