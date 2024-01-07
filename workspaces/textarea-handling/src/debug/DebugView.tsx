import { useService } from '../core/DIContainerProvider';
import { Editor } from '../core/common/Editor';
import { useEditorState } from '../core/useEditorState';
import { Node } from '../core/common/Node';
import { Path } from '../core/common/Path';
import { TextNode } from '../core/common/TextNode';
import { NodeSerializer } from '../serialize/NodeSerializer';
import { Cursor } from '../core/common/Cursor';
import { useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'textarea-handling-debug';

export const DebugView = () => {
    const editor = useService(Editor.ServiceKey);
    const nodeSerializer = useService(NodeSerializer.ServiceKey);
    const editorState = useEditorState(editor);

    useEffect(() => {
        const serializedNodes = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedNodes === null) return;
        const root = nodeSerializer.deserialize(JSON.parse(serializedNodes));
        editor.updateState((state) => state.copy({ root, cursor: Cursor.of(Path.of()) }));
    }, [editor, nodeSerializer]);

    useEffect(() => {
        const serializedNodes = nodeSerializer.serialize(editorState.root);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializedNodes));
    }, [editorState.root, nodeSerializer]);

    return (
        <div
            css={{
                padding: 16,
                fontFamily: 'monospace',
            }}
        >
            <section css={{ marginBottom: 32 }}>
                <div css={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
