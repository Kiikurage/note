import { ReactNode, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { Editor } from '../core/Editor';
import { keyframes } from '@emotion/react';
import { getKeyBindingService } from '../core/KeyBindingService';
import { initKeyBindingService } from './bootstrap';

export const EditorView = () => {
    const [editor, editorState] = useEditor();

    const content = useMemo<ReactNode>(() => {
        const lines: ReactNode[] = [];
        let lineFrom = 0;
        for (const line of editorState.value.split('\n')) {
            const lineTo = lineFrom + line.length + 1;

            const ranges = editorState.cursors
                .filter((cursor) => cursor.to >= lineFrom && cursor.from < lineTo)
                .map((cursor) => {
                    return {
                        cursor,
                        from: Math.max(0, Math.min(cursor.from - lineFrom, line.length)),
                        to: Math.max(0, Math.min(cursor.to - lineFrom, line.length)),
                        direction: cursor.direction,
                    };
                })
                .sort((r1, r2) => r1.from - r2.from);

            const fragments: ReactNode[] = [];

            let offset = 0;
            for (const range of ranges) {
                if (offset < range.from) {
                    fragments.push(<span key={`[${offset}, ${range.from})`}>{line.slice(offset, range.from)}</span>);
                    offset = range.from;
                }

                if (editorState.focused && range.direction === 'backward' && lineFrom + offset === range.cursor.focus) {
                    fragments.push(<Cursor key={`cursor-${range.cursor.focus}`} />);
                }

                if (range.from < range.to) {
                    fragments.push(
                        <span key={`sel-[${range.from}, ${range.to})`} css={{ background: 'rgba(100,157,255,0.21)' }}>
                            {line.slice(range.from, range.to)}
                        </span>,
                    );
                    offset = range.to;
                }

                if (editorState.focused && range.direction === 'forward' && lineFrom + offset === range.cursor.focus) {
                    fragments.push(
                        <span
                            key={`cmp-${range.cursor.focus}`}
                            css={{
                                textDecoration: 'underline',
                                textDecorationStyle: 'dotted',
                            }}
                        >
                            {editorState.compositionValue}
                        </span>,
                    );
                    fragments.push(<Cursor key={`cursor-${range.cursor.focus}`} />);
                }
            }
            if (offset < line.length) {
                fragments.push(<span key={`[${offset}, ${line.length})`}>{line.slice(offset, line.length)}</span>);
                offset = line.length;
            }

            lines.push(<p key={`${lineFrom}-${lineTo}`}>{fragments}</p>);

            lineFrom = lineTo;
        }

        return lines;
    }, [editorState]);

    return (
        <div
            css={{ position: 'absolute', inset: 0, padding: '24px', cursor: 'text', userSelect: 'none' }}
            onMouseDown={(ev) => {
                ev.preventDefault();
                editor.focus();
            }}
        >
            <pre
                css={{
                    margin: 0,
                    padding: 0,
                    fontFamily:
                        'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Hiragino Sans GB", メイリオ, Meiryo, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',

                    p: {
                        margin: 0,
                        height: '1.2em',
                        lineHeight: 1,
                    },
                }}
            >
                {content}
            </pre>
        </div>
    );
};

function useEditor() {
    const editorRef = useRef<Editor | null>(null);
    if (editorRef.current === null) {
        editorRef.current = new Editor();
    }
    const editor = editorRef.current;

    useEffect(() => {
        return () => {
            editor.dispose();
            editorRef.current = null;
        };
    }, [editor]);

    const state = useSyncExternalStore(
        (callback) => {
            editor.onChange.addListener(callback);
            return () => editor.onChange.removeListener(callback);
        },
        () => editor.state,
    );

    return [editor, state] as const;
}

const Cursor = () => (
    <span
        css={{
            background: 'black',
            display: 'inline-block',
            width: 0,
            outline: '1px solid black',
            height: '1em',
            verticalAlign: 'text-bottom',
            lineHeight: 1,
            animation: `${blink} 0.5s steps(2, jump-none) infinite alternate`,
        }}
    />
);

const blink = keyframes`
    0% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
`;

window.addEventListener('DOMContentLoaded', () => {
    initKeyBindingService();
});
