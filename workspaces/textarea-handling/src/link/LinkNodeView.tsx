import { LinkNode } from './LinkNode';
import { NodeChildren } from '../contenteditable/NodeChildren';
import { useService } from '../contenteditable/DIContainerProvider';
import { PositionMap } from '../contenteditable/PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../core/Position';

export const LinkNodeView = ({ node }: { node: LinkNode }) => {
    const positionMap = useService(PositionMap.ServiceKey);
    const ref = useRef<HTMLAnchorElement | null>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        positionMap.register(element, Position.of(node.id, 0));
        return () => positionMap.unregister(element);
    }, [node.id, positionMap]);

    return (
        <a href={node.props.href} ref={ref}>
            <NodeChildren parent={node} />
        </a>
    );
};
