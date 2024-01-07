import { Path } from '../core/common/core/Path';
import { LinkNode } from './LinkNode';
import { renderNodes } from '../contenteditable/view/DefaultNodeView';

export const LinkNodeView = ({ node, path }: { node: LinkNode; path: Path }) => {
    return (
        <a id={path.toString()} data-path={path} href={node.props.href}>
            {renderNodes(node.children, path)}
        </a>
    );
};
