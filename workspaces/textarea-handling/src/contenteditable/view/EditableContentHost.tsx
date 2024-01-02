import { MutableRefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { TextEntity } from './TextEntity';
import { getFocusState, getRangeFromDOM, setRangeToDOM } from './positions';
import { Editor } from '../../core/common/Editor';
import { InsertText } from '../common/command/InsertText';
import { SetCursorPosition } from '../common/command/SetCursorPosition';
import { EditorState } from '../../core/common/EditorState';
import { useService } from '../../core/view/DIContainerProvider';
import { useEditorState } from '../../core/view/useEditorState';
import { ContentEditEventHub } from '../common/ContentEditEventHub';
import { ClipboardService } from '../../clipboard/common/ClipboardService';
import { CommandService } from '../../core/common/CommandService';

export const EditableContentHost = () => {
    const editor = useService(Editor.ServiceKey);
    const editorState = useEditorState(editor);
    const commandService = useService(CommandService.ServiceKey);

    const ref = useRef<HTMLDivElement | null>(null);
    useDOMInput(ref, commandService);
    useSyncCursorPositionWithDOMEffects(ref, editorState, commandService);

    return (
        <>
            <div
                ref={ref}
                css={{
                    border: '1px solid #000',
                    position: 'absolute',
                    inset: 0,
                    padding: 16,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                }}
                contentEditable
                suppressContentEditableWarning
            >
                <TextEntity offset={0}>{editorState.value}</TextEntity>
            </div>
            <div
                contentEditable={false}
                css={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    padding: 16,
                    background: 'rgb(0 0 0 / 10%)',
                    fontFamily: 'monospace',
                }}
            >
                Rendered at {new Date().toISOString()}
            </div>
        </>
    );
};

function useDOMInput(ref: MutableRefObject<HTMLDivElement | null>, commandService: CommandService) {
    const service = useService(ContentEditEventHub.ServiceKey);

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

function useDOMFocusState(ref: MutableRefObject<HTMLDivElement | null>) {
    const [focused, setFocused] = useState(() => getFocusState(ref.current));

    useLayoutEffect(() => {
        const element = ref.current;
        if (element === null) return;

        const ownerDocument = element.ownerDocument;

        const handler = () => {
            setFocused(getFocusState(ref.current));
        };

        element.addEventListener('focus', handler);
        element.addEventListener('blur', handler);
        ownerDocument.addEventListener('focus', handler);
        ownerDocument.addEventListener('blur', handler);

        return () => {
            element.removeEventListener('focus', handler);
            element.removeEventListener('blur', handler);
            ownerDocument.removeEventListener('focus', handler);
            ownerDocument.removeEventListener('blur', handler);
        };
    }, [ref]);

    return focused;
}

function useSyncCursorPositionWithDOMEffects(
    ref: MutableRefObject<HTMLDivElement | null>,
    editorState: EditorState,
    commandService: CommandService,
) {
    const composing = useCompositionStatus(ref);
    const focused = useDOMFocusState(ref);

    useLayoutEffect(() => {
        const element = ref.current;
        if (element === null) return;

        const handlerSelectionChange = () => {
            if (composing) return;

            const range = getRangeFromDOM();
            if (range === null) return;

            commandService.exec(SetCursorPosition(range));
        };

        const ownerDocument = element.ownerDocument;

        ownerDocument.addEventListener('selectionchange', handlerSelectionChange);
        return () => {
            ownerDocument.removeEventListener('selectionchange', handlerSelectionChange);
        };
    }, [commandService, composing, ref]);

    useLayoutEffect(() => {
        if (composing) return;
        if (!focused) return;
        if (ref.current === null) return;

        setRangeToDOM(ref.current, editorState.cursors[0]);
    }, [composing, editorState.cursors, focused, ref]);
}
