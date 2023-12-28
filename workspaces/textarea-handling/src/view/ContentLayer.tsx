import { ReactNode, useMemo } from 'react';
import { useEditorState } from './useEditorState';
import { AnnotationList } from '../core/Annotation';
import { TextFragment } from './TextFragment';
import { Editor } from '../core/Editor';

export const ContentLayer = ({ editor }: { editor: Editor }) => {
    const editorState = useEditorState(editor);

    const ranges = AnnotationList.create(editorState);
    const content = useMemo<ReactNode>(() => {
        const lines: ReactNode[] = [];
        let fragments: ReactNode[] = [];

        for (const range of ranges) {
            while (lines.length < (range.line?.line ?? 0)) {
                lines.push(<p key={`L${lines.length}`}>{fragments}</p>);
                fragments = [];
            }

            fragments.push(<TextFragment key={`[${range.from},${range.to})`} range={range} editor={editor} />);
        }

        if (fragments.length > 0) {
            lines.push(<p key={`L${lines.length}`}>{fragments}</p>);
        }

        return lines;
    }, [editor, ranges]);

    return (
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
    );
};
