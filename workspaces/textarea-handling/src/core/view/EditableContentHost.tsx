import { MutableRefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useEditor } from './EditorProvider';
import { useEditorState } from './useEditorState';
import { InsertText } from '../model/command/InsertText';
import { DeleteContentBackward } from '../model/command/DeleteContentBackward';
import { DeleteContentForward } from '../model/command/DeleteContentForward';
import { Editor } from '../model/Editor';
import { EditorState } from '../model/EditorState';
import { DeleteHardLineBackward } from '../model/command/DeleteHardLineBackward';
import { TextEntity } from './TextEntity';
import { getFocusState, getRangeFromDOM, setRangeToDOM } from './positions';
import { SetCursorPosition } from '../model/command/SetCursorPosition';
import { DeleteSoftLineForward } from '../model/command/DeleteSoftLineForward';
import { DeleteSoftLineBackward } from '../model/command/DeleteSoftLineBackward';
import { InsertParagraph } from '../model/command/InsertParagraph';
import { InsertLineBreak } from '../model/command/InsertLineBreak';

export const EditableContentHost = () => {
    const editor = useEditor();
    const editorState = useEditorState(editor);

    const ref = useRef<HTMLDivElement | null>(null);
    useDOMInput(ref, editor);
    useSyncCursorPositionWithDOMEffects(ref, editor, editorState);

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

function useDOMInput(ref: MutableRefObject<HTMLDivElement | null>, editor: Editor) {
    const handleBeforeInput = useCallback(
        (ev: InputEvent) => {
            // List of well-known inputTypes: https://www.w3.org/TR/input-events-1/#interface-InputEvent-Attributes
            switch (ev.inputType) {
                case 'insertText':
                    editor.execCommand(InsertText({ text: ev.data ?? '' }));
                    ev.preventDefault();
                    break;

                case 'insertLineBreak':
                    editor.execCommand(InsertLineBreak());
                    ev.preventDefault();
                    break;

                case 'insertParagraph':
                    editor.execCommand(InsertParagraph());
                    ev.preventDefault();
                    break;

                case 'insertCompositionText':
                    ev.preventDefault();
                    break;

                case 'deleteContentBackward':
                    editor.execCommand(DeleteContentBackward());
                    ev.preventDefault();
                    break;

                case 'deleteContentForward':
                    editor.execCommand(DeleteContentForward());
                    ev.preventDefault();
                    break;

                case 'deleteSoftLineBackward':
                    editor.execCommand(DeleteSoftLineBackward());
                    ev.preventDefault();
                    break;

                case 'deleteSoftLineForward':
                    editor.execCommand(DeleteSoftLineForward());
                    ev.preventDefault();
                    break;

                case 'deleteHardLineBackward':
                    editor.execCommand(DeleteHardLineBackward());
                    ev.preventDefault();
                    break;

                case 'deleteHardLineForward':
                    editor.execCommand(DeleteHardLineBackward());
                    ev.preventDefault();
                    break;

                default:
                    ev.preventDefault();
            }
        },
        [editor],
    );

    const handleCompositionEnd = useCallback(
        (ev: CompositionEvent) => {
            editor.execCommand(InsertText({ text: ev.data ?? '' }));
            ev.preventDefault();
        },
        [editor],
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
    editor: Editor,
    editorState: EditorState,
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

            editor.execCommand(SetCursorPosition(range));
        };

        const ownerDocument = element.ownerDocument;

        ownerDocument.addEventListener('selectionchange', handlerSelectionChange);
        return () => {
            ownerDocument.removeEventListener('selectionchange', handlerSelectionChange);
        };
    }, [composing, editor, ref]);

    useLayoutEffect(() => {
        if (composing) return;
        if (!focused) return;
        if (ref.current === null) return;

        setRangeToDOM(ref.current, editorState.cursors[0]);
    }, [composing, editorState.cursors, focused, ref]);
}
