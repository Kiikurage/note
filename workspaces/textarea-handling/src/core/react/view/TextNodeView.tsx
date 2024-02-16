import { TextNode } from '../../common/node/TextNode';
import { useService } from '../EditorView';
import { PointMap } from '../PointMap';
import { useLayoutEffect, useRef } from 'react';
import { Point } from '../../common/Point';
import { assert } from '../../../lib/assert';

export const TextNodeView = ({ node }: { node: TextNode }) => {
    const pointMap = useService(PointMap.ComponentKey);
    const ref = useRef<HTMLSpanElement | null>(null);
    assert(node.text.length > 0, 'TextNodeView: node.text.length > 0');

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const textNode = element.childNodes[0];

        pointMap.register(textNode, node);
        return () => pointMap.unregister(textNode);
    }, [node, pointMap]);

    return <span ref={ref}>{node.text}</span>;
};
