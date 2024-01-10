import { DIContainer } from '../lib/DIContainer';
import { extension } from '../extension/Extension';
import { SerializeExtension } from '../serialize';

export const DebugExtension = extension({
    name: 'Debug',
    dependencies: [SerializeExtension],
    setup(container: DIContainer) {},
});
