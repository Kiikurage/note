import { TextNode } from '../core/common/TextNode';
import { Path } from '../core/common/Path';

export const TextNodeView = ({ node, path }: { node: TextNode; path: Path }) => {
    return (
        <span data-path={path} data-length={node.text.length}>
            {node.text}
        </span>
    );
};
