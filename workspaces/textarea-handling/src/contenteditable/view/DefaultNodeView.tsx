import { Node } from '../../core/common/core/Node';
import { TextNodeView } from './TextNodeView';
import { TextNode } from '../../core/common/node/TextNode';
import { Path } from '../../core/common/core/Path';
import { useEditorState } from '../../core/view/useEditorState';
import { useService } from '../../core/view/DIContainerProvider';
import { Editor } from '../../core/common/core/Editor';

const JOINER = '\u2060';

export const DefaultNodeView = ({ node, path }: { node: Node; path: Path }) => {
    const editor = useService(Editor.ServiceKey);
    const editorState = useEditorState(editor);

    return (
        <>
            <div
                id={path.toString()}
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
