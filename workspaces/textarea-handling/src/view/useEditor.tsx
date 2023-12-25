import { useEffect, useRef } from 'react';
import { Editor } from '../core/Editor';

export function useEditor() {
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

    return editor;
}
