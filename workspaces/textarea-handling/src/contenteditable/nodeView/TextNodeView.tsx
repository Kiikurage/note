import { TextNode } from '../../core/node/TextNode';
import { useService } from '../DIContainerProvider';
import { PositionMap } from '../PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../../core/Position';

export const TextNodeView = ({ node }: { node: TextNode }) => {
    const positionMap = useService(PositionMap.ServiceKey);
    const ref = useRef<HTMLSpanElement | null>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const domNode = node.text.length === 0 ? element : element.childNodes[0];

        positionMap.register(domNode, Position.of(node.id, 0));
        return () => positionMap.unregister(domNode);
    }, [node.id, node.text.length, positionMap]);

    return (
        <span ref={ref} data-node-id={node.id}>
            {node.text}
        </span>
    );
};
