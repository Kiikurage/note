import { NodeViewBase } from '../NodeViewBase';
import { NodeChildren } from '../NodeChildren';
import { ParagraphNode } from '../../core/node/ParagraphNode';

export const ParagraphNodeView = ({ node }: { node: ParagraphNode }) => (
    <NodeViewBase as="p" node={node}>
        <NodeChildren parent={node} />
    </NodeViewBase>
);
