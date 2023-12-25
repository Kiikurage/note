import { Logger } from '../lib/logger';
import {
    CompositionEventHandler,
    FocusEventHandler,
    KeyboardEventHandler,
    UIEventHandler,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { Editor } from '../core/Editor';
import { useEditorState } from './useEditorState';

export function InputReceiver({ editor }: { editor: Editor }) {
    const editorState = useEditorState(editor);

    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const updateFocusState = useCallback(() => {
        const textarea = textAreaRef.current;
        editor.inputReceiver.onFocusStateUpdate.fire({
            active: textarea !== null && textarea.ownerDocument.activeElement === textarea,
            rootFocused: textarea !== null && textarea.ownerDocument.hasFocus(),
        });
    }, [editor.inputReceiver]);

    useEffect(() => {
        window.addEventListener('focus', updateFocusState);
        window.addEventListener('blur', updateFocusState);
        return () => {
            window.removeEventListener('focus', updateFocusState);
            window.removeEventListener('blur', updateFocusState);
        };
    }, [updateFocusState]);

    useLayoutEffect(() => {
        const textArea = textAreaRef.current;
        if (textArea === null) return;

        if (editorState.active && textArea.ownerDocument.activeElement !== textArea) {
            requestAnimationFrame(() => textArea.focus());
        }
        if (!editorState.active && textArea.ownerDocument.activeElement === textArea) {
            requestAnimationFrame(() => textArea.blur());
        }
    }, [editorState.active]);

    const handleTextAreaFocus: FocusEventHandler = () => {
        updateFocusState();
    };

    const handleTextAreaBlur: FocusEventHandler = () => {
        updateFocusState();
    };

    const handleTextAreaCompositionEnd: CompositionEventHandler = (ev) => {
        editor.inputReceiver.onCompositionEnd.fire(ev.data ?? '');
    };

    const handleTextAreaInput: UIEventHandler<HTMLTextAreaElement> = (ev) => {
        const inputEvent = ev.nativeEvent as InputEvent;

        // List of well-known inputTypes: https://www.w3.org/TR/input-events-1/#interface-InputEvent-Attributes
        switch (inputEvent.inputType) {
            case 'insertText':
            case 'insertLineBreak':
                editor.inputReceiver.onInsert.fire(ev.currentTarget.value);
                ev.currentTarget.value = '';
                break;

            case 'insertCompositionText':
                editor.inputReceiver.onCompositionChange.fire(inputEvent.data ?? '');
                break;

            // Overridden by application
            case 'historyUndo':
            case 'historyRedo':
            case 'insertFromPaste':
                ev.currentTarget.value = '';
                ev.preventDefault();
                break;

            case 'deleteContentForward':
            case 'deleteContentBackward':
            case 'deleteByCut':
            case 'insertReplacementText':
            case 'insertParagraph':
            case 'insertOrderedList':
            case 'insertUnorderedList':
            case 'insertHorizontalRule':
            case 'insertFromYank':
            case 'insertFromDrop':
            case 'insertFromPasteAsQuotation':
            case 'insertTranspose':
            case 'insertLink':
            case 'deleteWordBackward':
            case 'deleteWordForward':
            case 'deleteSoftLineBackward':
            case 'deleteSoftLineForward':
            case 'deleteEntireSoftLine':
            case 'deleteHardLineBackward':
            case 'deleteHardLineForward':
            case 'deleteByDrag':
            case 'deleteContent':
            case 'formatBold':
            case 'formatItalic':
            case 'formatUnderline':
            case 'formatStrikeThrough':
            case 'formatSuperscript':
            case 'formatSubscript':
            case 'formatJustifyFull':
            case 'formatJustifyCenter':
            case 'formatJustifyRight':
            case 'formatJustifyLeft':
            case 'formatIndent':
            case 'formatOutdent':
            case 'formatRemove':
            case 'formatSetBlockTextDirection':
            case 'formatSetInlineTextDirection':
            case 'formatBackColor':
            case 'formatFontColor':
            case 'formatFontName':
            default:
                logger.warn(`Unsupported input type: ${inputEvent.inputType}`);
        }
    };

    const handleTextAreaKeyDown: KeyboardEventHandler = (ev) => {
        editor.inputReceiver.onKeyDown.fire(ev.nativeEvent);
    };

    return (
        <textarea
            ref={textAreaRef}
            onFocus={handleTextAreaFocus}
            onBlur={handleTextAreaBlur}
            onCompositionEnd={handleTextAreaCompositionEnd}
            onInput={handleTextAreaInput}
            onKeyDown={handleTextAreaKeyDown}
            defaultValue=""
            css={{
                pointerEvents: 'none',
                width: '0',
                height: '1em',
                border: 'none',
                padding: '0',
                margin: '0',
                verticalAlign: 'baseline',
            }}
        />
    );
}

const logger = new Logger(InputReceiver.name);
