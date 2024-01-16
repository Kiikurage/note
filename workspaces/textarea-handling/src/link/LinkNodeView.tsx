import { LinkNode } from './LinkNode';
import { NodeChildren } from '../contenteditable/nodeView/NodeChildren';
import { useService } from '../contenteditable/DIContainerProvider';
import { PositionMap } from '../contenteditable/PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../core/Position';
import { Editor } from '../core/Editor';
import { useEditorState } from '../contenteditable/useEditorState';

export const LinkNodeView = ({ node }: { node: LinkNode }) => {
    const positionMap = useService(PositionMap.ServiceKey);
    const ref = useRef<HTMLAnchorElement | null>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        positionMap.register(element, Position.of(node.id, 0));
        return () => positionMap.unregister(element);
    }, [node.id, positionMap]);

    const editor = useService(Editor.ServiceKey);
    const doc = useEditorState(editor).doc;

    if (doc.length(node.id) === 0) {
        return (
            <a href={node.props.href} ref={ref}>
                <span contentEditable={false} css={{ opacity: 0.5 }}>
                    link
                </span>
            </a>
        );
    } else {
        return (
            <a href={node.props.href} ref={ref}>
                <NodeChildren parent={node} />
            </a>
        );
    }
};
