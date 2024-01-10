import { createContext, ReactNode, useContext, useRef } from 'react';
import { DIContainer, ServiceKey } from '../lib/DIContainer';
import { Extension, loadExtension } from '../extension/Extension';

const context = createContext<DIContainer>(null as never);

export const DIContainerProvider = ({
    extensions = [],
    children,
}: {
    extensions?: Extension[];
    children?: ReactNode;
}) => {
    const containerRef = useRef<DIContainer>();
    if (containerRef.current === undefined) {
        const container = new DIContainer();
        extensions.forEach((extension) => loadExtension(extension, container));
        containerRef.current = container;
    }

    return <context.Provider value={containerRef.current}>{children}</context.Provider>;
};

export function useService<T>(key: ServiceKey<T>) {
    return useContext(context).get(key);
}
