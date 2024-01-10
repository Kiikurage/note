import { DIContainer } from '../lib/DIContainer';
import { extension } from '../extension/Extension';
import { NodeSerializer } from './NodeSerializer';
import { RootNode } from '../core/node/RootNode';
import { ParagraphNode } from '../core/node/ParagraphNode';
import { TextNode } from '../core/node/TextNode';

export const SerializeExtension = extension({
    name: 'Serialize',
    setup(container: DIContainer) {
        const serializer = container.get(NodeSerializer.ServiceKey);

        serializer.register(RootNode).register(ParagraphNode).register(TextNode);
    },
});
