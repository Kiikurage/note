import { Cursor } from '../core/Cursor';
import { useEffect, useRef, useState } from 'react';
import { useLayoutManagerContext, useLayoutManagerState } from './useLayoutManager';

export const CursorView = ({ cursor }: { cursor: Cursor }) => {
    const layoutManager = useLayoutManagerContext();
    const layoutManagerState = useLayoutManagerState(layoutManager);
    const fromPosition = layoutManagerState.getRectFromOffset(cursor.from);
    const toPosition = layoutManagerState.getRectFromOffset(cursor.to);
    const focusPosition = cursor.direction === 'forward' ? toPosition : fromPosition;

    return (
        <>
            <div
                style={{
                    top: fromPosition?.top,
                    left: fromPosition?.left,
                    width: (toPosition?.left ?? 0) - (fromPosition?.left ?? 0),
                    height: toPosition?.height ?? 0,
                }}
                css={{
                    position: 'absolute',
                    background: 'rgba(100,157,255,0.21)',
                }}
            />
            <Caret cursor={cursor} top={focusPosition?.top} left={focusPosition?.left} height={focusPosition?.height} />
        </>
    );
};

const Caret = ({ cursor, top, left, height }: { cursor: Cursor; top?: number; left?: number; height?: number }) => {
    const visible = useBlinkState(cursor);

    return (
        <span
            style={{ top, left }}
            css={{
                position: 'absolute',
                background: 'black',
                width: 1,
                height,
                visibility: visible ? 'visible' : 'hidden',
            }}
        />
    );
};

function useBlinkState(cursor: Cursor) {
    const [visible, setVisible] = useState(true);

    const lastCursorRef = useRef(cursor);
    if (lastCursorRef.current !== cursor) {
        setVisible(true);
        lastCursorRef.current = cursor;
    }

    useEffect(() => {
        const timerId = setInterval(() => {
            setVisible((visible) => !visible);
        }, 500);
        return () => {
            clearInterval(timerId);
        };
    }, [cursor]);

    return visible;
}
