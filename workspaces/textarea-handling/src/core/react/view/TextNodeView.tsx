import { TextNode } from '../../common/node/TextNode';
import { useService } from '../DIContainerProvider';
import { PositionMap } from '../PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../../common/Position';

export const TextNodeView = ({ node }: { node: TextNode }) => {
    const positionMap = useService(PositionMap.ServiceKey);
    const ref = useRef<HTMLSpanElement | null>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const domNode = node.text.length === 0 ? element : element.childNodes[0];

        positionMap.register(domNode, Position.of(node, 0));
        return () => positionMap.unregister(domNode);
    }, [node, positionMap]);

    return <span ref={ref}>{node.text}</span>;
};
