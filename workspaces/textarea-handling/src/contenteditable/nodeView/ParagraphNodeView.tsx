import { NodeChildren } from '../NodeChildren';
import { ParagraphNode } from '../../core/node/ContainerNode';
import { useService } from '../DIContainerProvider';
import { PositionMap } from '../PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../../core/Position';

export const ParagraphNodeView = ({ node }: { node: ParagraphNode }) => {
    const positionMap = useService(PositionMap.ServiceKey);
    const ref = useRef<HTMLParagraphElement | null>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        positionMap.register(element, Position.of(node.id, 0));
        return () => positionMap.unregister(element);
    }, [node.id, positionMap]);

    return (
        <p ref={ref}>
            <NodeChildren parent={node} />
        </p>
    );
};
