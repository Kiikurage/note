import { useEditorState } from './useEditorState';
import { CursorView } from './CursorView';
import { Editor } from '../core/Editor';

export const OverlayLayer = ({ editor }: { editor: Editor }) => {
    const editorState = useEditorState(editor);

    return (
        <div css={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {editorState.focused && editorState.cursors.map((cursor) => <CursorView key={cursor.id} cursor={cursor} />)}
        </div>
    );
};
