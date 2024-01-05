import { TextNode } from '../../core/common/node/TextNode';
import { Path } from '../../core/common/core/Path';

export const TextNodeView = ({ node, path }: { node: TextNode; path: Path }) => {
    return (
        <>
            <span id={path.toString()} data-path={path} data-length={node.text.length}>
                {node.text}
            </span>
        </>
    );
};
