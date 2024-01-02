import { assert } from './assert';

type ServiceKey<T> = symbol & { __type: T };

export class DIContainer {
    private readonly instances = new Map<symbol, unknown>();
    private static readonly factories = new Map<symbol, (container: DIContainer) => unknown>();

    static register<T>(factory: (container: DIContainer) => T) {
        const key = Symbol() as ServiceKey<T>;
        DIContainer.factories.set(key, factory);
        return key;
    }

    get<T>(key: ServiceKey<T>) {
        let instance = this.instances.get(key) as T | undefined;
        if (instance === undefined) {
            const factory = DIContainer.factories.get(key);
            assert(factory !== undefined, `Service is not registered`);

            instance = factory(this) as T;
            this.instances.set(key, instance);
        }
        return instance;
    }
}
