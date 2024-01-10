import { useService } from '../contenteditable/DIContainerProvider';
import { Editor } from '../core/Editor';
import { useEditorState } from '../contenteditable/useEditorState';
import { Node } from '../core/Node';
import { TextNode } from '../core/node/TextNode';
import { NodeSerializer } from '../serialize/NodeSerializer';
import { Cursor } from '../core/Cursor';
import { useEffect } from 'react';
import { Position } from '../core/Position';
import { Doc } from '../core/Doc';

const LOCAL_STORAGE_KEY = 'textarea-handling-debug';

export const DebugView = () => {
    const editor = useService(Editor.ServiceKey);
    const nodeSerializer = useService(NodeSerializer.ServiceKey);
    const editorState = useEditorState(editor);

    useEffect(() => {
        const serializedNodes = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedNodes === null) return;
        const doc = nodeSerializer.deserialize(JSON.parse(serializedNodes));
        editor.updateState((state) => state.copy({ doc, cursor: Cursor.of(Position.of(doc.root.id, 0)) }));
    }, [editor, nodeSerializer]);

    useEffect(() => {
        const serializedNodes = nodeSerializer.serialize(editorState.doc);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializedNodes));
    }, [editorState.doc, nodeSerializer]);

    return (
        <div
            css={{
                padding: 16,
                fontFamily: 'monospace',

                '> section': {
                    marginBottom: 32,
                },
            }}
        >
            <section>
                <div>Rendered at {new Date().toISOString()}</div>
            </section>
            <section>
                <h3 css={{ margin: 0 }}>Cursors</h3>
                <div>
                    <div>{editorState.cursor.toString()}</div>
                </div>
            </section>
            <section>
                <h3 css={{ margin: 0 }}>Document</h3>
                <NodeTreeNode node={editorState.doc.root} doc={editorState.doc} />
            </section>
        </div>
    );
};

const NodeTreeNode = ({ node, doc }: { node: Node; doc: Doc }) => {
    const children = doc.children(node.id);

    return (
        <div
            css={{
                listStyle: 'none',
            }}
        >
            <div css={{ margin: 0, lineHeight: 1.2 }}>
                <span>
                    ({node.id}){node.type}
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
            {children.length > 0 && (
                <div css={{ margin: 0, padding: 0, marginLeft: '16px' }}>
                    {children.map((child) => (
                        <NodeTreeNode key={child.id} node={child} doc={doc} />
                    ))}
                </div>
            )}
        </div>
    );
};
