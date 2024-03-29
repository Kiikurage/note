import { NodeChildren } from './NodeChildren';
import { useService } from '../EditorView';
import { PointMap } from '../../dom/PointMap';
import { useLayoutEffect, useRef } from 'react';
import { Point } from '../../core/Point';
import { ParagraphNode } from '../../core/node/ContainerNode';

export const ParagraphNodeView = ({ node }: { node: ParagraphNode }) => {
    const pointMap = useService(PointMap.ComponentKey);
    const ref = useRef<HTMLParagraphElement | null>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        pointMap.register(element, node);
        return () => pointMap.unregister(element);
    }, [node, pointMap]);

    return (
        <p ref={ref}>
            <NodeChildren parent={node} />
        </p>
    );
};
