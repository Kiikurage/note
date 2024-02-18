import { createRoot } from 'react-dom/client';
import { EditorView } from './react/EditorView';
import { ReactNode, useRef, useSyncExternalStore } from 'react';
import { Editor } from './core/Editor';
import { DocNode } from './core/node/DocNode';
import { TextNode } from './core/node/TextNode';

window.addEventListener('DOMContentLoaded', () => {
    createRoot(document.getElementById('root')!).render(<App />);
});

const App = () => {
    const editorRef = useRef<Editor>();
    if (editorRef.current === undefined) {
        editorRef.current = new Editor();
    }

    return (
        <div
            css={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                gridTemplateColumns: '50% 50%',
                gap: 32,
                padding: 32,
            }}
        >
            <div
                css={{
                    border: '1px solid #a0a0a0',
                }}
            >
                <EditorView editor={editorRef.current} />
            </div>
            <div>
                <DebugView editor={editorRef.current} />
            </div>
        </div>
    );
};

const DebugView = ({ editor }: { editor: Editor }) => {
    const state = useSyncExternalStore(
        (callback) => {
            editor.onChange.addListener(callback);
            return () => editor.onChange.removeListener(callback);
        },
        () => editor.state,
    );

    return (
        <div
            css={{
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
                gap: 32,

                h3: {
                    margin: 0,
                },
            }}
        >
            <section>
                <h3>Cursor</h3>
                {state.cursor.anchor.node.id}:{state.cursor.anchor.offset} - {state.cursor.focus.node.id}:
                {state.cursor.focus.offset}
            </section>
            <section>
                <h3>Doc</h3>
                <NodeTreeListItemView node={state.root} />
            </section>
        </div>
    );
};

const NodeTreeListItemView = ({ node }: { node: DocNode }) => {
    const type = node.constructor.name;

    let content: ReactNode = null;
    if (node instanceof TextNode) {
        content = <span>&quot;{node.text}&quot;</span>;
    }

    return (
        <div>
            ({node.id}):{type} {content}
            <div css={{ marginLeft: 16 }}>
                {node.children.map((child) => (
                    <NodeTreeListItemView key={child.id} node={child} />
                ))}
            </div>
        </div>
    );
};
