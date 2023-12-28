import { useLayoutEffect, useRef } from 'react';
import { useEditorState } from './useEditorState';
import { AnnotationRange } from '../core/Annotation';
import { caretPositionFromPoint } from '../lib/caretPositionFromPoint';
import { Editor } from '../core/Editor';
import { useAnnotatedTextMapContext } from './useAnnotatedTextMap';

export const AnnotatedText = ({ range, editor }: { range: AnnotationRange; editor: Editor }) => {
    const editorState = useEditorState(editor);
    const { setElement, unsetElement } = useAnnotatedTextMapContext();

    const spanRef = useRef<HTMLSpanElement | null>(null);

    useLayoutEffect(() => {
        const span = spanRef.current;
        if (span === null) return;

        setElement(range.from, span);
        return () => {
            unsetElement(range.from, span);
        };
    }, [range.from, setElement, unsetElement]);

    return (
        <span
            ref={spanRef}
            data-range-from={range.from}
            css={{
                background: range.cursor ? 'rgba(100,157,255,0.21)' : undefined,
                textDecoration: range.composition ? 'underline' : undefined,
                textDecorationStyle: 'dotted',
            }}
        >
            {editorState.value.substring(range.from, range.to)}
        </span>
    );
};

export function getOffsetFromPosition(document: Document, clientX: number, clientY: number) {
    const caretPosition = caretPositionFromPoint(document, clientX, clientY);
    if (caretPosition === null) return;

    let node: Node | null = caretPosition.offsetNode;
    do {
        if (node instanceof HTMLElement) {
            if (node.dataset.rangeFrom) {
                const rangeFrom = Number(node.dataset.rangeFrom);
                return rangeFrom + caretPosition.offset;
            }
        }
        node = node.parentNode;
    } while (node !== null);
}
