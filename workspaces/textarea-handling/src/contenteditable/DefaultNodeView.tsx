import { Node } from '../core/common/Node';
import { TextNodeView } from './TextNodeView';
import { TextNode } from '../core/common/TextNode';
import { Path } from '../core/common/Path';
import { useEditorState } from '../core/useEditorState';
import { useService } from '../core/DIContainerProvider';
import { Editor } from '../core/common/Editor';
import { LinkNodeView } from '../link/LinkNodeView';
import { LinkNode } from '../link/LinkNode';

const JOINER = '\u2060';

export const DefaultNodeView = ({ node, path }: { node: Node; path: Path }) => {
    const editor = useService(Editor.ServiceKey);
    const editorState = useEditorState(editor);

    return (
        <div
            data-path={path}
            css={{
                display: 'block',
                position: 'relative',

                ...(editorState.debug && {
                    border: '1px solid #000',
                    padding: '4px',
                    marginTop: '1em',
                    background: 'rgba(0,0,0,0.1)',

                    '&::after': {
                        whiteSpace: 'nowrap',
                        color: '#0a0',
                        position: 'absolute',
                        top: '-1.25em',
                        fontSize: '0.75em',
                        lineHeight: 1,
                        left: 0,
                        content: `"(${node.id})${node.type}"`,
                        fontFamily: 'monospace',
                    },
                }),
            }}
        >
            {node.length === 0 && JOINER}
            {renderNodes(node.children, path)}
        </div>
    );
};

export function renderNodes(nodes: readonly Node[], path: Path) {
    return nodes.map((node, i) => {
        const nodePath = path.child(node.id);
        if (node instanceof TextNode) {
            return <TextNodeView key={nodePath.toString()} node={node} path={nodePath} />;
        } else if (node instanceof LinkNode) {
            return <LinkNodeView key={nodePath.toString()} node={node} path={nodePath} />;
        } else {
            return <DefaultNodeView key={nodePath.toString()} node={node} path={nodePath} />;
        }
    });
}
