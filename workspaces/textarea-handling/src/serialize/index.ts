import { DIContainer } from '../core/common/DIContainer';
import { extension } from '../core/common/Extension';
import { NodeSerializer } from './common/NodeSerializer';
import { RootNode } from '../core/common/node/RootNode';
import { ParagraphNode } from '../core/common/node/ParagraphNode';
import { TextNode } from '../core/common/node/TextNode';

export const SerializeExtension = extension({
    name: 'Serialize',
    setup(container: DIContainer) {
        const serializer = container.get(NodeSerializer.ServiceKey);

        serializer.register(RootNode).register(ParagraphNode).register(TextNode);
    },
});
