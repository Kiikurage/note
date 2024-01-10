import { DIContainer, serviceKey, ServiceKey } from '../lib/DIContainer';
import { Logger } from '../lib/logger';

const logger = new Logger('Extension');

export interface Extension {
    key: ServiceKey<Extension>;
    dependencies?: Extension[];

    setup(container: DIContainer): void;
}

export function extension(props: {
    name: string;
    dependencies?: Extension[];
    setup(container: DIContainer): void;
}): Extension {
    return {
        key: serviceKey<Extension>(props.name),
        dependencies: props.dependencies,
        setup: props.setup,
    };
}

export function loadExtension(extension: Extension, container: DIContainer) {
    if (container.has(extension.key)) return;
    container.register(extension.key, extension);

    if (extension.dependencies !== undefined) {
        for (const dependency of extension.dependencies) {
            loadExtension(dependency, container);
        }
    }

    logger.info(`Loading extension ${extension.key.description}`);
    extension.setup(container);
}
