import { NodeViewBase } from '../NodeViewBase';
import { NodeChildren } from '../NodeChildren';
import { RootNode } from '../../core/node/RootNode';

export const RootNodeView = ({ node }: { node: RootNode }) => (
    <NodeViewBase as="div" node={node}>
        <NodeChildren parent={node} />
    </NodeViewBase>
);
