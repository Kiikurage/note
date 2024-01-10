import { DIContainer } from '../lib/DIContainer';
import { Node, NodeConstructor, NodeId } from '../core/Node';
import { Doc } from '../core/Doc';

export class NodeSerializer {
    static readonly ServiceKey = DIContainer.register(() => new NodeSerializer());
    private readonly nodeConstructors = new Map<string, NodeConstructor>();

    register(nodeConstructor: NodeConstructor): this {
        this.nodeConstructors.set(Node.getTypeName(nodeConstructor), nodeConstructor);
        return this;
    }

    serialize(doc: Doc): SerializedNode {
        function serializeNode(node: Node): SerializedNode {
            return {
                type: node.type,
                props: node.props,
                children: doc.children(node.id).map((child) => serializeNode(child)),
            };
        }

        return serializeNode(doc.root);
    }

    deserialize(serializedRoot: SerializedNode): Doc {
        let doc = Doc.empty();

        const deserializeNode = (parentId: NodeId, serializedNode: SerializedNode) => {
            const nodeConstructor = this.nodeConstructors.get(serializedNode.type);
            if (nodeConstructor === undefined)
                throw new Error(`NodeConstructor for type ${serializedNode.type} is not registered.`);

            const node = new nodeConstructor(serializedNode.props);
            doc = doc.insertLast(parentId, node);

            serializedNode.children.forEach((child) => deserializeNode(node.id, child));
        };

        serializedRoot.children.forEach((child) => deserializeNode(doc.root.id, child));
        return doc;
    }
}

interface SerializedNode {
    type: string;
    props: Record<string, unknown>;
    children: SerializedNode[];
}
