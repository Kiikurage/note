import { Path, TextNode } from '../../core/common/Node';

export const TextNodeView = ({ node, path }: { node: TextNode; path: Path }) => {
    return (
        <>
            <span id={path.toString()} data-path={path} data-length={node.value.length}>
                {node.value}
            </span>
        </>
    );
};
