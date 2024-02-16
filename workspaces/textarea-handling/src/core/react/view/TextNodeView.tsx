import { TextNode } from '../../common/node/TextNode';
import { useService } from '../EditorContextProvider';
import { PositionMap } from '../PositionMap';
import { useLayoutEffect, useRef } from 'react';
import { Position } from '../../common/Position';
import { assert } from '../../../lib/assert';

export const TextNodeView = ({ node }: { node: TextNode }) => {
    const positionMap = useService(PositionMap.ComponentKey);
    const ref = useRef<HTMLSpanElement | null>(null);
    assert(node.text.length > 0, 'TextNodeView: node.text.length > 0');

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const textNode = element.childNodes[0];

        positionMap.register(textNode, node);
        return () => positionMap.unregister(textNode);
    }, [node, positionMap]);

    return <span ref={ref}>{node.text}</span>;
};
