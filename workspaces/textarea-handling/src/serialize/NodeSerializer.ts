import { DIContainer } from '../core/common/DIContainer';
import { Node, NodeConstructor } from '../core/common/Node';

export class NodeSerializer {
    static readonly ServiceKey = DIContainer.register(() => new NodeSerializer());
    private readonly nodeConstructors = new Map<string, NodeConstructor>();

    register(nodeConstructor: NodeConstructor): this {
        this.nodeConstructors.set(Node.getTypeName(nodeConstructor), nodeConstructor);
        return this;
    }

    serialize(node: Node): SerializedNode {
        return {
            type: node.type,
            props: node.props,
            children: node.children.map((child) => this.serialize(child)),
        };
    }

    deserialize(serializedNode: SerializedNode): Node {
        const nodeConstructor = this.nodeConstructors.get(serializedNode.type);
        if (!nodeConstructor) {
            throw new Error(`No node constructor registered for type ${serializedNode.type}`);
        }

        return new nodeConstructor(
            serializedNode.props,
            serializedNode.children.map((child) => this.deserialize(child)),
        );
    }
}

interface SerializedNode {
    type: string;
    props: Record<string, unknown>;
    children: SerializedNode[];
}
