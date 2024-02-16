import { NodeChildren } from './NodeChildren';
import { RootNode } from '../../common/node/RootNode';
import { useEditorState, useService } from '../EditorView';
import { PointMap } from '../PointMap';
import { useLayoutEffect, useRef } from 'react';
import { Point } from '../../common/Point';
import { DOMEventHandlerManager } from '../DOMEventHandlerManager';

export const RootNodeView = ({ node }: { node: RootNode }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const pointMap = useService(PointMap.ComponentKey);
    const domEventHandlerManager = useService(DOMEventHandlerManager.ComponentKey);
    const editorState = useEditorState();

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        pointMap.register(element, node);
        return () => pointMap.unregister(element);
    }, [node, pointMap]);

    useLayoutEffect(
        () => domEventHandlerManager.registerRootElementEventHandlers(ref.current),
        [domEventHandlerManager],
    );

    useLayoutEffect(() => {
        if (domEventHandlerManager.isComposing) return;

        requestAnimationFrame(() => {
            pointMap.setSelection(editorState.cursor.anchor, editorState.cursor.focus);
        });
    }, [domEventHandlerManager.isComposing, editorState.cursor.anchor, editorState.cursor.focus, pointMap]);

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
