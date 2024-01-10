import { Node } from '../../core/Node';
import { NodeViewBase } from '../NodeViewBase';
import { NodeChildren } from '../NodeChildren';

export const DefaultNodeView = ({ node }: { node: Node }) => (
    <NodeViewBase as="div" node={node}>
        <NodeChildren parent={node} />
    </NodeViewBase>
);
