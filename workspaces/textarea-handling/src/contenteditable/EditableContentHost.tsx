import { MutableRefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { getSelectionFromDOM, setSelectionToDOM } from './positions';
import { Editor } from '../core/common/Editor';
import { InsertText } from './common/command/InsertText';
import { EditorState } from '../core/common/EditorState';
import { useService } from '../core/DIContainerProvider';
import { useEditorState } from '../core/useEditorState';
import { ContentEditEventHub } from './common/ContentEditEventHub';
import { CommandService } from '../core/common/CommandService';
import { DefaultNodeView } from './DefaultNodeView';
import { Node } from '../core/common/Node';
import { Path } from '../core/common/Path';
import { TextNode } from '../core/common/TextNode';
import { SetCursorPosition } from './common/command/SetCursorPosition';

export const EditableContentHost = () => {
    const editor = useService(Editor.ServiceKey);
    const editorState = useEditorState(editor);
    const commandService = useService(CommandService.ServiceKey);

    const ref = useRef<HTMLDivElement | null>(null);
    useDOMInput(ref, commandService);
    useSyncCursorPositionWithDOMEffects(ref, editorState, commandService);

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
            }}
            contentEditable
            suppressContentEditableWarning
            data-content-editable-host="true"
        >
            <DefaultNodeView node={editorState.root} path={Path.of()} />
        </div>
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

function useSyncCursorPositionWithDOMEffects(
    ref: MutableRefObject<HTMLDivElement | null>,
    editorState: EditorState,
    commandService: CommandService,
) {
    const composing = useCompositionStatus(ref);

    useLayoutEffect(() => {
        const element = ref.current;
        if (element === null) return;

        const handlerSelectionChange = () => {
            if (composing) return;

            const positions = getSelectionFromDOM(element);
            if (positions === null) return;

            commandService.exec(SetCursorPosition(positions));
        };

        const ownerDocument = element.ownerDocument;

        ownerDocument.addEventListener('selectionchange', handlerSelectionChange);
        return () => {
            ownerDocument.removeEventListener('selectionchange', handlerSelectionChange);
        };
    }, [commandService, composing, ref]);

    useLayoutEffect(() => {
        if (composing) return;
        if (ref.current === null) return;

        setSelectionToDOM(ref.current, editorState.cursor);
    }, [composing, editorState, ref]);
}
