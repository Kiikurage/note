import { MouseEventHandler, ReactNode, useCallback, useLayoutEffect, useRef } from 'react';
import { useLayoutManagerContext, useLayoutManagerState } from './useLayoutManager';
import { Editor } from '../core/Editor';

export const EditorBaseView = ({ children, editor }: { children?: ReactNode; editor: Editor }) => {
    const layoutManager = useLayoutManagerContext();
    const layoutManagerState = useLayoutManagerState(layoutManager);

    const handleMouseDown: MouseEventHandler = useCallback(
        (ev) => {
            ev.preventDefault();
            editor.focus();

            const offset = layoutManagerState.getOffsetFromPosition(ev.clientX, ev.clientY);
            if (offset !== null) {
                editor.setCursorPosition(offset);
            }
        },
        [editor, layoutManagerState],
    );

    const editorBaseRef = useRef<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
        const editorBase = editorBaseRef.current;
        if (editorBase === null) return;

        layoutManager.setBaseElement(editorBase);
        return () => layoutManager.setBaseElement(null);
    }, [layoutManager]);

    return (
        <div
            css={{ position: 'absolute', inset: 24, cursor: 'text', userSelect: 'none' }}
            ref={editorBaseRef}
            onMouseDown={handleMouseDown}
        >
            {children}
        </div>
    );
};
