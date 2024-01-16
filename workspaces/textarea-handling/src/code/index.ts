import { DIContainer } from '../lib/DIContainer';
import { extension } from '../extension/Extension';
import { KeyBindingService } from '../keybinding/common/KeyBindingService';
import { KeyBindingExtension } from '../keybinding';
import { CommandService } from '../command/CommandService';
import { ToggleCode } from './ToggleCode';
import { SerializeExtension } from '../serialize';
import { NodeSerializer } from '../serialize/NodeSerializer';
import { InlineCodeNode } from './InlineCodeNode';
import { ReactComponentTypeMap } from '../contenteditable/ReactComponentTypeMap';
import { InlineCodeNodeView } from './InlineCodeNodeView';

export const CodeExtension = extension({
    name: 'Code',
    dependencies: [KeyBindingExtension, SerializeExtension],
    setup(container: DIContainer) {
        const commandService = container.get(CommandService.ServiceKey);
        const keyBinding = container.get(KeyBindingService.ServiceKey);
        const serializer = container.get(NodeSerializer.ServiceKey);
        const reactComponentTypeMap = container.get(ReactComponentTypeMap.ServiceKey);

        keyBinding
            .registerBinding({ command: 'insertCode', key: 'cmd+shift+k' })
            .registerHandler('insertCode', () => commandService.exec(ToggleCode()));

        serializer.register(InlineCodeNode);

        reactComponentTypeMap.register(InlineCodeNode, InlineCodeNodeView);
    },
});
