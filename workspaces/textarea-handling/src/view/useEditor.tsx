import { useEffect, useRef } from 'react';
import { Editor } from '../core/Editor';

export function useEditor() {
    const editorRef = useRef<Editor>();
    if (editorRef.current === undefined) {
        const editor = new Editor();
        editor.insertText(`サンプルテキスト
0123456789
ABCDEFGHIJKLMNOPQRSTUVWXYZ`);
        editorRef.current = editor;
    }

    useEffect(() => {
        return () => {
            editorRef.current?.dispose();
        };
    }, [editorRef]);

    return editorRef.current;
}
