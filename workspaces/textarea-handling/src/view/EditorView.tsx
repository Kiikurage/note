import { ReactNode, useLayoutEffect, useMemo, useRef } from 'react';
import { keyframes } from '@emotion/react';
import { initKeyBindingService } from './bootstrap';
import { useEditor, useInputReceiver } from './useEditor';
import { useEditorState } from './useEditorState';
import { EditorState } from '../core/EditorState';
import { Cursor } from '../core/Cursor';
import { noop } from '../lib';

interface Marker {
    offset: number;
    line?: number;
    selectionStart: string[];
    selectionEnd: string[];
    cursor: boolean;
    compositionStart: string[];
    compositionEnd: string[];
}

interface MarkerRange {
    from: number;
    to: number;
    line: number;
    selected: boolean;
    composing: boolean;
    endWithCursor: boolean;
}

class MarkerList {
    markers = new Map<number, Marker>();

    addSelectionRange(cursor: Cursor) {
        this.setMarker(cursor.from, (marker) => marker.selectionStart.push(cursor.id));
        this.setMarker(cursor.to, (marker) => marker.selectionEnd.push(cursor.id));
        this.setMarker(cursor.focus, (marker) => (marker.cursor = true));
    }

    addCompositionRange(from: number, to: number, compositionId: string) {
        this.setMarker(from, (marker) => marker.compositionStart.push(compositionId));
        this.setMarker(to, (marker) => marker.compositionEnd.push(compositionId));
    }

    setMarker(offset: number, updater: (marker: Marker) => void) {
        let marker = this.markers.get(offset);
        if (marker === undefined) {
            marker = {
                offset,
                selectionStart: [],
                selectionEnd: [],
                cursor: false,
                compositionStart: [],
                compositionEnd: [],
            };
            this.markers.set(offset, marker);
        }

        updater(marker);
    }

    toRanges(): MarkerRange[] {
        const markers = Array.from(this.markers.entries())
            .sort((a, b) => a[0] - b[0])
            .map((entry) => entry[1]);

        const ranges: MarkerRange[] = [];
        const state = {
            line: 0,
            offset: 0,
            selection: new Set<string>(),
            composition: new Set<string>(),
        };

        for (const marker of markers) {
            ranges.push({
                from: state.offset,
                to: marker.offset,
                line: state.line,
                selected: state.selection.size > 0,
                composing: state.composition.size > 0,
                endWithCursor: marker.cursor,
            });
            state.offset = marker.offset;

            state.line = marker.line ?? state.line;

            for (const selectionId of marker.selectionStart) {
                state.selection.add(selectionId);
            }
            for (const selectionId of marker.selectionEnd) {
                state.selection.delete(selectionId);
            }
            for (const compositionId of marker.compositionStart) {
                state.composition.add(compositionId);
            }
            for (const compositionId of marker.compositionEnd) {
                state.composition.delete(compositionId);
            }
        }

        return ranges;
    }

    static create(editorState: EditorState) {
        const markerList = new MarkerList();

        let offset = 0;
        editorState.value.split('\n').forEach((line, l) => {
            markerList.setMarker(offset, (marker) => (marker.line = l));
            offset = Math.min(editorState.length, offset + line.length + 1);
        });

        for (const cursor of editorState.cursors) markerList.addSelectionRange(cursor);

        for (const range of editorState.compositionRanges) {
            markerList.addCompositionRange(range.from, range.to, range.cursorId);
        }

        markerList.setMarker(0, noop);
        markerList.setMarker(editorState.length, noop);

        return markerList.toRanges();
    }
}

export const EditorView = () => {
    const editor = useEditor();
    const inputReceiver = useInputReceiver(editor);
    const editorState = useEditorState(editor);

    const ranges = MarkerList.create(editorState);
    console.log(ranges);

    const content = useMemo<ReactNode>(() => {
        const lines: ReactNode[] = [];
        let fragments: ReactNode[] = [];
        let line = 0;

        for (const range of ranges) {
            while (line < range.line) {
                lines.push(<p key={`L${line}`}>{fragments}</p>);
                line++;
                fragments = [];
            }

            fragments.push(
                <span
                    key={`[${range.from},${range.to})`}
                    css={{
                        background: range.selected ? 'rgba(100,157,255,0.21)' : undefined,
                        textDecoration: range.composing ? 'underline' : undefined,
                        textDecorationStyle: 'dotted',
                    }}
                >
                    {editorState.value.substring(range.from, range.to)}
                    {range.endWithCursor && editorState.focused && <CursorView />}
                </span>,
            );
        }

        if (fragments.length > 0) {
            lines.push(<p key={`L${line}`}>{fragments}</p>);
            line++;
        }

        return lines;
    }, [ranges, editorState.value, editorState.focused]);

    const backgroundLayerRef = useRef<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
        const backgroundLayer = backgroundLayerRef.current;
        if (backgroundLayer === null) return;

        if (inputReceiver.textarea.parentElement === backgroundLayer) return;
        backgroundLayer.appendChild(inputReceiver.textarea);
    }, [inputReceiver.textarea]);

    return (
        <div
            css={{ position: 'absolute', inset: 24, cursor: 'text', userSelect: 'none' }}
            onMouseDown={(ev) => {
                ev.preventDefault();
                editor.focus();
            }}
        >
            <div css={{ position: 'absolute', inset: 0, background: '#fff' }} ref={backgroundLayerRef} />
            <div css={{ position: 'absolute', inset: 0, background: '#fff' }}>
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
const CursorView = () => {
    return (
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
};

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
