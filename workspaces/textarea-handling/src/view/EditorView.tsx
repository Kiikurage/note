import { ReactNode, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { Editor } from './Editor';
import { assert } from '../lib';
import { keyframes } from '@emotion/react';

export const EditorView = () => {
    const [editor, editorState] = useEditor();

    const content = useMemo<ReactNode>(() => {
        assert(editorState.cursors.length === 1, 'Only one cursor is supported');

        const cursorFrom = editorState.cursors[0].from;
        const cursorTo = editorState.cursors[0].to;
        const cursorDirection = editorState.cursors[0].direction;

        const rows: ReactNode[] = [];
        let lineFrom = 0;
        for (const line of editorState.value.split('\n')) {
            const lineTo = Math.min(editorState.length, lineFrom + line.length + 1);
            const cursorFromInLine = Math.max(0, Math.min(cursorFrom - lineFrom, line.length));
            const cursorToInLine = Math.max(0, Math.min(cursorTo - lineFrom, line.length));

            rows.push(
                <p key={`${lineFrom}-${lineTo}`}>
                    <span>{line.slice(0, cursorFromInLine)}</span>
                    {editorState.focused &&
                        cursorDirection === 'backward' &&
                        lineFrom + cursorFromInLine === cursorFrom && <Cursor />}
                    <span
                        css={{
                            background: 'rgba(100,157,255,0.21)',
                        }}
                    >
                        {line.slice(cursorFromInLine, cursorToInLine)}
                    </span>
                    {editorState.focused && cursorDirection === 'forward' && lineFrom + cursorToInLine === cursorTo && (
                        <>
                            <span
                                css={{
                                    textDecoration: 'underline',
                                    textDecorationStyle: 'dotted',
                                }}
                            >
                                {editorState.compositionValue}
                            </span>
                            <Cursor key={editorState.timestamp} />
                        </>
                    )}
                    <span>{line.slice(cursorToInLine)}</span>
                </p>,
            );

            lineFrom = lineTo;
        }

        return rows;
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
