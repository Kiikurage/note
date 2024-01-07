import { DIContainer } from '../core/common/DIContainer';
import { extension } from '../core/common/Extension';
import { NodeSerializer } from './NodeSerializer';
import { RootNode } from '../core/common/RootNode';
import { ParagraphNode } from '../core/common/ParagraphNode';
import { TextNode } from '../core/common/TextNode';

export const SerializeExtension = extension({
    name: 'Serialize',
    setup(container: DIContainer) {
        const serializer = container.get(NodeSerializer.ServiceKey);

        serializer.register(RootNode).register(ParagraphNode).register(TextNode);
    },
});
