import { InlineCodeNode } from './InlineCodeNode';
import { NodeChildren } from '../contenteditable/nodeView/NodeChildren';
import { useService } from '../contenteditable/DIContainerProvider';
import { PositionMap } from '../contenteditable/PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../core/Position';

export const InlineCodeNodeView = ({ node }: { node: InlineCodeNode }) => {
    const positionMap = useService(PositionMap.ServiceKey);
    const ref = useRef<HTMLElement | null>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        positionMap.register(element, Position.of(node.id, 0));
        return () => positionMap.unregister(element);
    }, [node.id, positionMap]);

    // const editor = useService(Editor.ServiceKey);
    // const doc = useEditorState(editor).doc;

    return (
        <code
            ref={ref}
            css={{
                fontSize: '1.5em',
                display: 'inline-block',
                fontFamily: 'monospace',
                padding: '2px 4px',
                margin: '0 2px',
                background: '#e0e0e0',
                borderRadius: 4,
            }}
        >
            <NodeChildren parent={node} />
        </code>
    );
};
