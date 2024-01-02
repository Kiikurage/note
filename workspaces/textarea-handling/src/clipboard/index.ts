import { DIContainer } from '../core/common/DIContainer';
import { ClipboardService } from './common/ClipboardService';
import { extension } from '../core/common/Extension';
import { KeyBindingExtension } from '../keybinding';

export const ClipboardExtension = extension({
    name: 'Clipboard',
    dependencies: [KeyBindingExtension],
    setup(container: DIContainer) {
        container.get(ClipboardService.ServiceKey);
    },
});
