import { useEffect, useMemo } from 'react';
import { Editor } from '../core/Editor';

export function useEditor() {
    const editor = useMemo(() => {
        const editor = new Editor();
        editor.insertText(`サンプルテキスト
0123456789
ABCDEFGHIJKLMNOPQRSTUVWXYZ`);
        return editor;
    }, []);

    useEffect(() => {
        return () => {
            editor.dispose();
        };
    }, [editor]);

    return editor;
}
