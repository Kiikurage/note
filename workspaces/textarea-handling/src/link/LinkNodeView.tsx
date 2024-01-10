import { LinkNode } from './LinkNode';
import { NodeViewBase } from '../contenteditable/NodeViewBase';
import { NodeChildren } from '../contenteditable/NodeChildren';

export const LinkNodeView = ({ node }: { node: LinkNode }) => (
    <NodeViewBase node={node} as="a" href={node.props.href}>
        <NodeChildren parent={node} />
    </NodeViewBase>
);
