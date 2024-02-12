import { Editor } from '../core/common/Editor';
import { TextNode } from '../core/common/node/TextNode';
import { EditorState } from '../core/common/EditorState';
import { assert } from '../lib/assert';
import { useRef } from 'react';
import { DocNode } from '../core/common/node/DocNode';
import { useService } from '../core/react/DIContainerProvider';
import { useEditorState } from '../core/react/useEditorState';

export const DebugView = () => {
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;
    const editor = useService(Editor.ServiceKey);
    const editorState = useEditorState(editor);

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
                    Document <button onClick={() => editor.updateState(() => EditorState.create())}>RESET</button>
                </h3>
                <NodeTreeNode node={editorState.root} />
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

const NodeTreeNode = ({ node }: { node: DocNode }) => {
    return (
        <div
            css={{
                listStyle: 'none',
            }}
        >
            <div css={{ margin: 0, lineHeight: 1.2 }}>
                <span>
                    ({node.id}){node.constructor.name}
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
            {node.children.length > 0 && (
                <div css={{ margin: 0, padding: 0, marginLeft: '16px' }}>
                    {node.children.map((child) => (
                        <NodeTreeNode key={child.id} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
};
