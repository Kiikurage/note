import { MutableRefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Editor } from '../common/Editor';
import { InsertText } from '../common/command/InsertText';
import { EditorState } from '../common/EditorState';
import { useService } from './DIContainerProvider';
import { useEditorState } from './useEditorState';
import { CommandService } from '../../command/CommandService';
import { SetCursor } from '../common/command/SetCursor';
import { ReactComponentTypeMap } from './ReactComponentTypeMap';
import { PositionMap } from './PositionMap';
import { ContentEditEventHub } from './ContentEditEventHub';
import { TextNode } from '../common/node/TextNode';
import { insertText } from '../common/mutate/insertText';
import { Cursor } from '../common/Cursor';

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
            {componentTypeMap.render(editorState.root)}
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

    useLayoutEffect(() => {
        const element = ref.current;
        if (element === null) return;

        element.addEventListener('beforeinput', handleBeforeInput);
        return () => {
            element.removeEventListener('beforeinput', handleBeforeInput);
        };
    }, [handleBeforeInput, ref]);
}

function useCompositionStatus(ref: MutableRefObject<HTMLDivElement | null>) {
    const [composing, setComposing] = useState(false);
    const editor = useService(Editor.ServiceKey);
    const commandService = useService(CommandService.ServiceKey);
    const editorState = useEditorState(editor);

    useLayoutEffect(() => {
        const element = ref.current;
        if (element === null) return;

        const handleCompositionStart = () => {
            // Create text node to handle inserting text correctly
            if (!(editorState.cursor.anchor.node instanceof TextNode)) {
                editor.updateState((state) => {
                    state = insertText(state, ZERO_WIDTH_SPACE);
                    state = { ...state, cursor: Cursor.of(state.cursor.anchor.node, state.cursor.anchor.offset - 1) };
                    return state;
                });
            }
            setComposing(true);
        };
        const handleCompositionEnd = (ev: CompositionEvent) => {
            // Clean up dummy zero-width space
            editor.updateState((state) => {
                const node = state.cursor.anchor.node;
                if (!(node instanceof TextNode)) return state;
                if (node.text !== ZERO_WIDTH_SPACE) return state;
                node.text = '';
                return { ...state };
            });
            commandService.exec(InsertText({ text: ev.data ?? '' }));
            setComposing(false);
        };

        element.addEventListener('compositionstart', handleCompositionStart);
        element.addEventListener('compositionend', handleCompositionEnd);
        return () => {
            element.removeEventListener('compositionstart', handleCompositionStart);
            element.removeEventListener('compositionend', handleCompositionEnd);
        };
    }, [commandService, editor, editorState.cursor.anchor, ref]);

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

            commandService.exec(SetCursor({ cursor: Cursor.of(selection.anchor, selection.focus) }));
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

const ZERO_WIDTH_SPACE = '\u200B';
