import { MutableRefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { getSelectionFromDOM, setSelectionToDOM } from './positions';
import { Editor } from '../../core/common/core/Editor';
import { InsertText } from '../common/command/InsertText';
import { EditorState } from '../../core/common/core/EditorState';
import { useService } from '../../core/view/DIContainerProvider';
import { useEditorState } from '../../core/view/useEditorState';
import { ContentEditEventHub } from '../common/ContentEditEventHub';
import { CommandService } from '../../core/common/CommandService';
import { DefaultNodeView } from './DefaultNodeView';
import { Node } from '../../core/common/core/Node';
import { Path } from '../../core/common/core/Path';
import { TextNode } from '../../core/common/node/TextNode';
import { SetCursorPosition } from '../common/command/SetCursorPosition';

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
                data-content-editable-host="true"
            >
                <DefaultNodeView node={editorState.root} path={Path.of()} />
            </div>
            <div
                css={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '400px',
                    maxWidth: '50%',
                    padding: 16,
                    background: 'rgb(0 0 0 / 10%)',
                    fontFamily: 'monospace',
                }}
            >
                Rendered at {new Date().toISOString()}
                <section css={{ marginTop: 32 }}>
                    <h3 css={{ margin: 0 }}>Cursors</h3>
                    <div>
                        <div>{editorState.cursor.toString()}</div>
                    </div>
                </section>
                <section css={{ marginTop: 16 }}>
                    <h3 css={{ margin: 0 }}>Document</h3>
                    <NodeTreeNode node={editorState.root} path={Path.of()} />
                </section>
            </div>
        </>
    );
};

const NodeTreeNode = ({ node, path }: { node: Node; path: Path }) => {
    return (
        <div
            css={{
                listStyle: 'none',
            }}
        >
            <div css={{ margin: 0, lineHeight: 1.2 }}>
                <span>
                    {'-'.repeat(path.depth)}({node.id}){node.type}
                </span>
                {node instanceof TextNode && (
                    <span css={{ marginLeft: 8, color: '#888' }}>
                        &quot;
                        <span
                            css={{
                                whiteSpace: 'pre',
                                display: 'inline-block',
                                maxWidth: '64px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                verticalAlign: 'bottom',
                            }}
                        >
                            {node.text}
                        </span>
                        &quot;
                    </span>
                )}
            </div>
            {node.length > 0 && (
                <div css={{ margin: 0, padding: 0 }}>
                    {node.children.map((child) => (
                        <NodeTreeNode key={child.id} node={child} path={path.child(child.id)} />
                    ))}
                </div>
            )}
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

// function useDOMFocusState(ref: MutableRefObject<HTMLDivElement | null>) {
//     const [focused, setFocused] = useState(() => getFocusState(ref.current));
//
//     useLayoutEffect(() => {
//         const element = ref.current;
//         if (element === null) return;
//
//         const ownerDocument = element.ownerDocument;
//
//         const handler = () => {
//             setFocused(getFocusState(ref.current));
//         };
//
//         element.addEventListener('focus', handler);
//         element.addEventListener('blur', handler);
//         ownerDocument.addEventListener('focus', handler);
//         ownerDocument.addEventListener('blur', handler);
//
//         return () => {
//             element.removeEventListener('focus', handler);
//             element.removeEventListener('blur', handler);
//             ownerDocument.removeEventListener('focus', handler);
//             ownerDocument.removeEventListener('blur', handler);
//         };
//     }, [ref]);
//
//     return focused;
// }

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
