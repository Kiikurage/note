import { NodeChildren } from './NodeChildren';
import { useService } from '../EditorContextProvider';
import { PositionMap } from '../PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../../common/Position';
import { ParagraphNode } from '../../common/node/ContainerNode';

export const ParagraphNodeView = ({ node }: { node: ParagraphNode }) => {
    const positionMap = useService(PositionMap.ComponentKey);
    const ref = useRef<HTMLParagraphElement | null>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        positionMap.register(element, node);
        return () => positionMap.unregister(element);
    }, [node, positionMap]);

    return (
        <p ref={ref}>
            <NodeChildren parent={node} />
        </p>
    );
};
