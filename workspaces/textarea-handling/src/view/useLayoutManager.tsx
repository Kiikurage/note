import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import { LayoutManager } from './LayoutManager';

const context = createContext<LayoutManager>(null as never);

export function useLayoutManagerContext() {
    return useContext(context);
}

export function useLayoutManagerState(layoutManager: LayoutManager) {
    return useSyncExternalStore(
        (callback) => {
            layoutManager.onChange.addListener(callback);
            return () => layoutManager.onChange.removeListener(callback);
        },
        () => layoutManager.state,
    );
}

export function useLayoutManager(): LayoutManager {
    const layoutManagerRef = useRef<LayoutManager>();
    if (layoutManagerRef.current === undefined) {
        layoutManagerRef.current = new LayoutManager();
    }

    useEffect(() => {
        return () => {
            layoutManagerRef.current?.dispose();
        };
    }, [layoutManagerRef]);

    return layoutManagerRef.current;
}

export const LayoutManagerProvider = context.Provider;
