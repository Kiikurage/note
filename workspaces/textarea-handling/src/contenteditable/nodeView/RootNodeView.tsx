import { NodeChildren } from './NodeChildren';
import { RootNode } from '../../core/node/RootNode';
import { useService } from '../DIContainerProvider';
import { PositionMap } from '../PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../../core/Position';

export const RootNodeView = ({ node }: { node: RootNode }) => {
    const positionMap = useService(PositionMap.ServiceKey);
    const ref = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        positionMap.register(element, Position.of(node.id, 0));
        return () => positionMap.unregister(element);
    }, [node.id, positionMap]);

    return (
        <div ref={ref}>
            <NodeChildren parent={node} />
        </div>
    );
};
