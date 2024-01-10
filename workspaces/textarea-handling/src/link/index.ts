import { DIContainer } from '../lib/DIContainer';
import { extension } from '../extension/Extension';
import { KeyBindingService } from '../keybinding/common/KeyBindingService';
import { KeyBindingExtension } from '../keybinding';
import { CommandService } from '../command/CommandService';
import { InsertLink } from './InsertLink';
import { SerializeExtension } from '../serialize';
import { NodeSerializer } from '../serialize/NodeSerializer';
import { LinkNode } from './LinkNode';
import { ReactComponentTypeMap } from '../contenteditable/ReactComponentTypeMap';
import { LinkNodeView } from './LinkNodeView';

export const LinkExtension = extension({
    name: 'Link',
    dependencies: [KeyBindingExtension, SerializeExtension],
    setup(container: DIContainer) {
        const commandService = container.get(CommandService.ServiceKey);
        const keyBinding = container.get(KeyBindingService.ServiceKey);
        const serializer = container.get(NodeSerializer.ServiceKey);
        const reactComponentTypeMap = container.get(ReactComponentTypeMap.ServiceKey);

        keyBinding
            .registerBinding({ command: 'insertLink', key: 'cmd+k' })
            .registerHandler('insertLink', () => commandService.exec(InsertLink()));

        serializer.register(LinkNode);

        reactComponentTypeMap.register(LinkNode, LinkNodeView);
    },
});
