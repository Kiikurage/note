import { useService } from '../contenteditable/DIContainerProvider';
import { Editor } from '../core/Editor';
import { useEditorState } from '../contenteditable/useEditorState';
import { TextNode } from '../core/node/TextNode';
import { NodeSerializer } from '../serialize/NodeSerializer';
import { Cursor } from '../core/Cursor';
import { Position } from '../core/Position';
import { EditorState } from '../core/EditorState';
import { createDoc } from '../core/createDoc';
import { Doc, Node } from '../core/interfaces';
import { assert } from '../lib/assert';
import { useRef } from 'react';

const LOCAL_STORAGE_KEY = 'textarea-handling-debug';

export const DebugView = () => {
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;
    const editor = useService(Editor.ServiceKey);
    const nodeSerializer = useService(NodeSerializer.ServiceKey);
    const editorState = useEditorState(editor);

    // useEffect(() => {
    //     const serializedNodes = localStorage.getItem(LOCAL_STORAGE_KEY);
    //     if (serializedNodes === null) return;
    //     const doc = nodeSerializer.deserialize(JSON.parse(serializedNodes));
    //     editor.updateState((state) => state.copy({ doc, cursor: Cursor.of(Position.of(doc.root.id, 0)) }));
    // }, [editor, nodeSerializer]);
    //
    // useEffect(() => {
    //     const serializedNodes = nodeSerializer.serialize(editorState.doc);
    //     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializedNodes));
    // }, [editorState.doc, nodeSerializer]);

    const selection = document.getSelection();
    const anchorNode = selection?.anchorNode ?? null;
    const anchorOffset = selection?.anchorOffset ?? null;
    const focusNode = selection?.focusNode ?? null;
    const focusOffset = selection?.focusOffset ?? null;

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
                <div>
                    Render:{renderCountRef.current}. Last at {new Date().toISOString()}.
                </div>
            </section>
            <section>
                <h3 css={{ margin: 0 }}>Cursor</h3>
                <div>{editorState.cursor.toString()}</div>
                <div>
                    Anchor: <NodeView node={anchorNode} offset={anchorOffset} />
                </div>
                <div>
                    Focus: <NodeView node={focusNode} offset={focusOffset} />
                </div>
            </section>
            <section>
                <h3 css={{ margin: 0 }}>
                    Document{' '}
                    <button
                        onClick={() =>
                            editor.updateState(() => {
                                const doc = createDoc();
                                return new EditorState({
                                    doc,
                                    cursor: Cursor.of(Position.of(doc.root.id, 0)),
                                });
                            })
                        }
                    >
                        RESET
                    </button>
                </h3>
                <NodeTreeNode node={editorState.doc.root} doc={editorState.doc} />
            </section>
        </div>
    );
};

const NodeView = ({ node, offset }: { node: globalThis.Node | null; offset: number | null }) => {
    if (node === null) return '#N/A';

    if (node instanceof Text) return `#Text "${node.textContent}" ${offset ?? '#N/A'}`;
    assert(node instanceof Element, 'node is Element');

    return `<${node.tagName.toLowerCase()} /> ${offset ?? '#N/A'}`;
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
