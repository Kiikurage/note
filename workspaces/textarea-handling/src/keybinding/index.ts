import { DIContainer } from '../core/common/DIContainer';
import { extension } from '../core/common/Extension';
import { KeyBindingService } from './common/KeyBindingService';

export const KeyBindingExtension = extension({
    name: 'KeyBinding',
    setup(container: DIContainer) {
        container.get(KeyBindingService.ServiceKey);
    },
});
