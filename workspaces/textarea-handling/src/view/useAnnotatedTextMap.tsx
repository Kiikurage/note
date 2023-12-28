import { createContext, useCallback, useContext, useRef } from 'react';

interface AnnotatedTextMapContext {
    map: ReadonlyMap<number, Element>;
    setElement: (fromOffset: number, element: Element) => void;
    unsetElement: (fromOffset: number, element: Element) => void;
}

const context = createContext<AnnotatedTextMapContext>(null as never);

export function useAnnotatedTextMapContext() {
    return useContext(context);
}

export function useAnnotatedTextMapContextValue(): AnnotatedTextMapContext {
    const mapRef = useRef<Map<number, Element>>();
    if (mapRef.current === undefined) {
        mapRef.current = new Map<number, Element>();
    }
    const map = mapRef.current;

    const setElement = useCallback(
        (fromOffset: number, element: Element) => {
            map.set(fromOffset, element);
        },
        [map],
    );

    const unsetElement = useCallback(
        (fromOffset: number, element: Element) => {
            if (map.get(fromOffset) === element) {
                map.delete(fromOffset);
            }
        },
        [map],
    );

    return { setElement, unsetElement, map };
}

export const AnnotatedTextMapProvider = context.Provider;
