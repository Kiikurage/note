import { useLayoutEffect, useRef } from 'react';
import { useEditorState } from './useEditorState';
import { useInputReceiver } from './useInputReceiver';
import { useLayoutManager, useLayoutManagerState } from './useLayoutManager';
import { Editor } from '../core/Editor';

export const InputReceiverLayer = ({ editor }: { editor: Editor }) => {
    const inputReceiver = useInputReceiver(editor);
    const editorState = useEditorState(editor);
    const layoutManager = useLayoutManager();
    const layoutManagerState = useLayoutManagerState(layoutManager);
    const backgroundLayerRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const backgroundLayer = backgroundLayerRef.current;
        if (backgroundLayer === null) return;

        if (inputReceiver.textarea.parentElement === backgroundLayer) return;
        backgroundLayer.appendChild(inputReceiver.textarea);
    }, [inputReceiver.textarea]);
    const firstCaretRect = layoutManagerState.getRectFromOffset(editorState.cursors[0].focus);
    if (firstCaretRect !== null) {
        inputReceiver.textarea.style.top = `${firstCaretRect.top ?? 0}px`;
        inputReceiver.textarea.style.left = `${firstCaretRect.left ?? 0}px`;
        inputReceiver.textarea.style.fontSize = `${firstCaretRect.height ?? 0}px`;
    }

    return <div css={{ position: 'absolute', inset: 0, overflow: 'hidden' }} ref={backgroundLayerRef} />;
};
