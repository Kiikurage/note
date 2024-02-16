import { NodeChildren } from './NodeChildren';
import { RootNode } from '../../common/node/RootNode';
import { useEditorState, useService } from '../EditorContextProvider';
import { PositionMap } from '../PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../../common/Position';
import { DOMEventHandlerManager } from '../DOMEventHandlerManager';

export const RootNodeView = ({ node }: { node: RootNode }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const positionMap = useService(PositionMap.ComponentKey);
    const domEventHandlerManager = useService(DOMEventHandlerManager.ComponentKey);
    const editorState = useEditorState();

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        positionMap.register(element, node);
        return () => positionMap.unregister(element);
    }, [node, positionMap]);

    useLayoutEffect(
        () => domEventHandlerManager.registerRootElementEventHandlers(ref.current),
        [domEventHandlerManager],
    );

    useLayoutEffect(() => {
        if (domEventHandlerManager.isComposing) return;

        requestAnimationFrame(() => {
            positionMap.setSelection(editorState.cursor.anchor, editorState.cursor.focus);
        });
    }, [domEventHandlerManager.isComposing, editorState.cursor.anchor, editorState.cursor.focus, positionMap]);

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
            <NodeChildren parent={node} />
        </div>
    );
};
