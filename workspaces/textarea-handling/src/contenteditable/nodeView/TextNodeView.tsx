import { TextNode } from '../../core/node/TextNode';
import { NodeViewBase } from '../NodeViewBase';

const JOINER = '\u2060';

export const TextNodeView = ({ node }: { node: TextNode }) => (
    <NodeViewBase as="span" node={node} data-length={node.length}>
        {node.text.length === 0 ? JOINER : node.text}
    </NodeViewBase>
);
