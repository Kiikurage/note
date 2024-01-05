import { Node } from '../../core/common/core/Node';
import { TextNodeView } from './TextNodeView';
import { TextNode } from '../../core/common/node/TextNode';
import { Path } from '../../core/common/core/Path';

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
                        whiteSpace: 'nowrap',
                        color: '#0a0',
                        position: 'absolute',
                        bottom: '-1em',
                        left: 0,
                        content: `"(${node.id})${node.type}"`,
                        fontFamily: 'monospace',
                    },
                }}
            >
                {node.children.map((child, i) => {
                    const childPath = path.child(child.id);
                    if (child instanceof TextNode) {
                        return <TextNodeView key={childPath.toString()} node={child} path={childPath} />;
                    } else {
                        return <DefaultNodeView key={childPath.toString()} node={child} path={childPath} />;
                    }
                })}
            </div>
        </>
    );
};
