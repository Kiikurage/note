import { DIContainer } from '../lib/DIContainer';
import { extension } from '../extension/Extension';
import { KeyBindingService } from './common/KeyBindingService';

export const KeyBindingExtension = extension({
    name: 'KeyBinding',
    setup(container: DIContainer) {
        container.get(KeyBindingService.ServiceKey);
    },
});
