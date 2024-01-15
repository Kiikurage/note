import { assert } from './assert';

export type ServiceKey<T> = symbol & { __type: T };

export function serviceKey<T>(name?: string): ServiceKey<T> {
    return Symbol(name) as ServiceKey<T>;
}

export class DIContainer {
    private readonly services = new Map<symbol, unknown>();
    private static readonly factories = new Map<symbol, (container: DIContainer) => unknown>();

    static register<T>(factory: (container: DIContainer) => T) {
        const key = serviceKey<T>(factory.name);
        DIContainer.factories.set(key, factory);
        return key;
    }

    register<T>(key: ServiceKey<T>, service: T) {
        this.services.set(key, service);
    }

    get<T>(key: ServiceKey<T>) {
        let service = this.services.get(key) as T | undefined;
        if (service === undefined) {
            const factory = DIContainer.factories.get(key);
            assert(factory !== undefined, `Service is not registered`);

            service = factory(this) as T;
            this.services.set(key, service);
        }
        return service;
    }

    has<T>(key: ServiceKey<T>) {
        return this.services.has(key);
    }
}
