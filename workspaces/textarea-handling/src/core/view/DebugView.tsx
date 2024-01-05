import { useService } from './DIContainerProvider';
import { Editor } from '../common/core/Editor';
import { useEditorState } from './useEditorState';
import { Path } from '../common/core/Path';
import { Node } from '../common/core/Node';
import { TextNode } from '../common/node/TextNode';

export const DebugView = () => {
    const editor = useService(Editor.ServiceKey);
    const editorState = useEditorState(editor);

    return (
        <div
            css={{
                padding: 16,
                fontFamily: 'monospace',
            }}
        >
            <section css={{ marginBottom: 32 }}>
                <div>
                    <label css={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            css={{ margin: '0 8px 0 0' }}
                            type="checkbox"
                            checked={editorState.debug}
                            onChange={(ev) =>
                                editor.updateState((state) => state.copy({ debug: ev.currentTarget.checked }))
                            }
                        />
                        Show debug info
                    </label>
                </div>
            </section>
            <section css={{ marginBottom: 32 }}>
                <div>Rendered at {new Date().toISOString()}</div>
            </section>
            <section css={{ marginBottom: 32 }}>
                <h3 css={{ margin: 0 }}>Cursors</h3>
                <div>
                    <div>{editorState.cursor.toString()}</div>
                </div>
            </section>
            <section css={{ marginBottom: 16 }}>
                <h3 css={{ margin: 0 }}>Document</h3>
                <NodeTreeNode node={editorState.root} path={Path.of()} />
            </section>
        </div>
    );
};

const NodeTreeNode = ({ node, path }: { node: Node; path: Path }) => {
    return (
        <div
            css={{
                listStyle: 'none',
            }}
        >
            <div css={{ margin: 0, lineHeight: 1.2 }}>
                <span>
                    {'-'.repeat(path.depth)}({node.id}){node.type}
                </span>
                {node instanceof TextNode && (
                    <span css={{ marginLeft: 8, color: '#888' }}>
                        &quot;
                        <span
                            css={{
                                whiteSpace: 'pre',
                                display: 'inline-block',
                                maxWidth: '64px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                verticalAlign: 'bottom',
                            }}
                        >
                            {node.text}
                        </span>
                        &quot;
                    </span>
                )}
            </div>
            {node.length > 0 && (
                <div css={{ margin: 0, padding: 0 }}>
                    {node.children.map((child) => (
                        <NodeTreeNode key={child.id} node={child} path={path.child(child.id)} />
                    ))}
                </div>
            )}
        </div>
    );
};
