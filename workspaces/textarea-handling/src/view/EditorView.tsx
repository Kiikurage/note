import { ReactNode, useLayoutEffect, useMemo, useRef } from 'react';
import { useEditor } from './useEditor';
import { useEditorState } from './useEditorState';
import { AnnotationList } from '../core/Annotation';
import { CursorView } from './CursorView';
import { isMac, isWin } from '../lib/os';
import { getKeyBindingService } from '../core/KeyBindingService';
import { useInputReceiver } from './useInputReceiver';

export const EditorView = () => {
    const editor = useEditor();
    const inputReceiver = useInputReceiver(editor);
    const editorState = useEditorState(editor);
    const ranges = AnnotationList.create(editorState);

    const backgroundLayerRef = useRef<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
        const backgroundLayer = backgroundLayerRef.current;
        if (backgroundLayer === null) return;

        if (inputReceiver.textarea.parentElement === backgroundLayer) return;
        backgroundLayer.appendChild(inputReceiver.textarea);
    }, [inputReceiver.textarea]);

    const content = useMemo<ReactNode>(() => {
        const lines: ReactNode[] = [];
        let fragments: ReactNode[] = [];

        for (const range of ranges) {
            while (lines.length < (range.line?.line ?? 0)) {
                lines.push(<p key={`L${lines.length}`}>{fragments}</p>);
                fragments = [];
            }

            if (range.cursor?.from === range.from && range.cursor?.direction === 'backward' && editorState.focused) {
                fragments.push(<CursorView />);
            }

            fragments.push(
                <span
                    key={`[${range.from},${range.to})`}
                    css={{
                        background: range.cursor ? 'rgba(100,157,255,0.21)' : undefined,
                        textDecoration: range.composition ? 'underline' : undefined,
                        textDecorationStyle: 'dotted',
                    }}
                >
                    {editorState.value.substring(range.from, range.to)}
                </span>,
            );

            if (range.cursor?.to === range.to && range.cursor?.direction === 'forward' && editorState.focused) {
                fragments.push(<CursorView />);
            }
        }

        if (fragments.length > 0) {
            lines.push(<p key={`L${lines.length}`}>{fragments}</p>);
        }

        return lines;
    }, [editorState.focused, editorState.value, ranges]);

    return (
        <div
            css={{ position: 'absolute', inset: 24, cursor: 'text', userSelect: 'none' }}
            onMouseDown={(ev) => {
                ev.preventDefault();
                editor.focus();
            }}
        >
            <div css={{ position: 'absolute', inset: 0, width: 0, overflow: 'hidden' }} ref={backgroundLayerRef} />
            <div css={{ position: 'absolute', inset: 0 }}>
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
        </div>
    );
};

window.addEventListener('DOMContentLoaded', () => {
    initKeyBindings();
});

function initKeyBindings() {
    const keyBindingService = getKeyBindingService();

    keyBindingService
        .registerBinding({ key: 'backspace', command: 'deleteLeft' })
        .registerBinding({ key: 'delete', command: 'deleteRight' })
        .registerBinding({ key: 'left', command: 'cursorLeft' })
        .registerBinding({ key: 'shift+left', command: 'cursorLeftSelect' })
        .registerBinding({ key: 'right', command: 'cursorRight' })
        .registerBinding({ key: 'shift+right', command: 'cursorRightSelect' });

    if (isMac()) {
        keyBindingService
            .registerBinding({ key: 'cmd+a', command: 'editor.action.selectAll' })
            .registerBinding({ key: 'cmd+left', command: 'cursorHome' })
            .registerBinding({ key: 'cmd+shift+left', command: 'cursorHomeSelect' })
            .registerBinding({ key: 'cmd+right', command: 'cursorEnd' })
            .registerBinding({ key: 'cmd+shift+right', command: 'cursorEndSelect' });
    }

    if (isWin()) {
        keyBindingService
            .registerBinding({ key: 'ctrl+a', command: 'editor.action.selectAll' })
            .registerBinding({ key: 'ctrl+left', command: 'cursorHome' })
            .registerBinding({ key: 'ctrl+shift+left', command: 'cursorHomeSelect' })
            .registerBinding({ key: 'ctrl+right', command: 'cursorEnd' })
            .registerBinding({ key: 'ctrl+shift+right', command: 'cursorEndSelect' });
    }
}
