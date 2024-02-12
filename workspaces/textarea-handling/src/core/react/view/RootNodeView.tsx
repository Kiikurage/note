import { NodeChildren } from './NodeChildren';
import { RootNode } from '../../common/node/RootNode';
import { useService } from '../DIContainerProvider';
import { PositionMap } from '../PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../../common/Position';

export const RootNodeView = ({ node }: { node: RootNode }) => {
    const positionMap = useService(PositionMap.ServiceKey);
    const ref = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        positionMap.register(element, Position.of(node, 0));
        return () => positionMap.unregister(element);
    }, [node, positionMap]);

    return (
        <div ref={ref}>
            <NodeChildren parent={node} />
        </div>
    );
};
