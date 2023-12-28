import { useLayoutEffect, useRef } from 'react';
import { useEditorState } from './useEditorState';
import { AnnotationRange } from '../core/Annotation';
import { Editor } from '../core/Editor';
import { useLayoutManagerContext } from './useLayoutManager';

export const TextFragment = ({ range, editor }: { range: AnnotationRange; editor: Editor }) => {
    const editorState = useEditorState(editor);
    const layoutManager = useLayoutManagerContext();

    const spanRef = useRef<HTMLSpanElement | null>(null);

    useLayoutEffect(() => {
        const span = spanRef.current;
        if (span === null) return;

        layoutManager.setTextFragment(range.from, span);
        return () => {
            layoutManager.unsetTextFragment(range.from, span);
        };
    }, [layoutManager, range.from]);

    return (
        <span
            ref={spanRef}
            data-range-from={range.from}
            css={{
                textDecoration: range.composition ? 'underline' : undefined,
                textDecorationStyle: 'dotted',
            }}
        >
            {editorState.value.substring(range.from, range.to)}
        </span>
    );
};
