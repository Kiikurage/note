import { MutableRefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Editor } from '../core/Editor';
import { InsertText } from './common/command/InsertText';
import { EditorState } from '../core/EditorState';
import { useService } from './DIContainerProvider';
import { useEditorState } from './useEditorState';
import { CommandService } from '../command/CommandService';
import { SetCursorPosition } from './common/command/SetCursorPosition';
import { ReactComponentTypeMap } from './ReactComponentTypeMap';
import { PositionMap } from './PositionMap';
import { ContentEditEventHub } from './common/ContentEditEventHub';

export const EditableContentHost = () => {
    const editor = useService(Editor.ServiceKey);
    const editorState = useEditorState(editor);
    const componentTypeMap = useService(ReactComponentTypeMap.ServiceKey);

    const ref = useRef<HTMLDivElement | null>(null);
    useDOMInput(ref);
    useSyncCursorPositionWithDOMEffects(ref, editorState);

    return (
        <div
            ref={ref}
            css={{
                inset: 0,
                padding: 16,
                boxSizing: 'border-box',
                minHeight: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',

                p: {
                    margin: 0,
                },
            }}
            contentEditable
            suppressContentEditableWarning
        >
            {componentTypeMap.render(editorState.doc.root)}
        </div>
    );
};

function useDOMInput(ref: MutableRefObject<HTMLDivElement | null>) {
    const service = useService(ContentEditEventHub.ServiceKey);
    const commandService = useService(CommandService.ServiceKey);

    const handleBeforeInput = useCallback(
        (ev: InputEvent) => {
            if (ev.type === 'insertCompositionText') {
                ev.preventDefault();
                return;
            }

            service.fire(ev.inputType, ev.data);
            ev.preventDefault();
        },
        [service],
    );

    const handleCompositionEnd = useCallback(
        (ev: CompositionEvent) => {
            commandService.exec(InsertText({ text: ev.data ?? '' }));
            ev.preventDefault();
        },
        [commandService],
    );

    useLayoutEffect(() => {
        const element = ref.current;
        if (element === null) return;

        element.addEventListener('beforeinput', handleBeforeInput);
        element.addEventListener('compositionend', handleCompositionEnd);
        return () => {
            element.removeEventListener('beforeinput', handleBeforeInput);
            element.removeEventListener('compositionend', handleCompositionEnd);
        };
    }, [handleBeforeInput, handleCompositionEnd, ref]);
}

function useCompositionStatus(ref: MutableRefObject<HTMLDivElement | null>) {
    const [composing, setComposing] = useState(false);

    useLayoutEffect(() => {
        const element = ref.current;
        if (element === null) return;

        const handleCompositionStart = () => setComposing(true);
        const handleCompositionEnd = () => setComposing(false);

        element.addEventListener('compositionstart', handleCompositionStart);
        element.addEventListener('compositionend', handleCompositionEnd);
        return () => {
            element.removeEventListener('compositionstart', handleCompositionStart);
            element.removeEventListener('compositionend', handleCompositionEnd);
        };
    }, [ref]);

    return composing;
}

function useSyncCursorPositionWithDOMEffects(ref: MutableRefObject<HTMLDivElement | null>, editorState: EditorState) {
    const positionMap = useService(PositionMap.ServiceKey);
    const commandService = useService(CommandService.ServiceKey);
    const composing = useCompositionStatus(ref);

    useLayoutEffect(() => {
        const element = ref.current;
        if (element === null) return;

        const handlerSelectionChange = () => {
            if (composing) return;

            const selection = positionMap.getSelection();
            if (selection === null) return;

            commandService.exec(SetCursorPosition(selection));
        };

        const ownerDocument = element.ownerDocument;

        ownerDocument.addEventListener('selectionchange', handlerSelectionChange);
        return () => {
            ownerDocument.removeEventListener('selectionchange', handlerSelectionChange);
        };
    }, [commandService, composing, positionMap, ref]);

    useLayoutEffect(() => {
        if (composing) return;
        if (ref.current === null) return;

        positionMap.setSelection(editorState.cursor.anchor, editorState.cursor.focus);
    }, [composing, editorState, positionMap, ref]);
}
