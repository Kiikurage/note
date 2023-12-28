import { useEffect, useMemo } from 'react';
import { Editor } from '../core/Editor';

export function useEditor() {
    const editor = useMemo(() => {
        return new Editor();
    }, []);

    useEffect(() => {
        return () => {
            editor.dispose();
        };
    }, [editor]);

    return editor;
}
