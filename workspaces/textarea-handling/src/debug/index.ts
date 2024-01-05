import { DIContainer } from '../core/common/DIContainer';
import { extension } from '../core/common/Extension';
import { SerializeExtension } from '../serialize';

export const DebugExtension = extension({
    name: 'Debug',
    dependencies: [SerializeExtension],
    setup(container: DIContainer) {},
});
