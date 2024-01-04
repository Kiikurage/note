import { Node, Path, TextNode } from '../../core/common/Node';
import { TextNodeView } from './TextNodeView';

export const DefaultNodeView = ({ node, path }: { node: Node; path: Path }) => {
    return (
        <>
            <div
                id={path.toString()}
                data-path={path}
                css={{
                    display: 'inline-block',
                    position: 'relative',
                    border: '1px solid #000',
                    padding: '4px',
                    marginBottom: '1em',
                    background: 'rgba(0,0,0,0.1)',
                    lineHeight: 1,

                    '&::after': {
                        color: '#0a0',
                        position: 'absolute',
                        bottom: '-1em',
                        left: 0,
                        content: `"${path.toString()}:${node.type}"`,
                        fontFamily: 'monospace',
                    },
                }}
            >
                {node.children.map((child, i) => {
                    const childPath = Path.of(...path.offsets, i);
                    if (TextNode.isTextNode(child)) {
                        return <TextNodeView key={childPath.toString()} node={child} path={childPath} />;
                    } else {
                        return <DefaultNodeView key={childPath.toString()} node={child} path={childPath} />;
                    }
                })}
            </div>
        </>
    );
};
