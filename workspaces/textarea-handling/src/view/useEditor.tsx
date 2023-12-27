import { useEffect, useMemo } from 'react';
import { Editor } from '../core/Editor';
import { InputReceiver } from './InputReceiver';

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

export function useInputReceiver(editor: Editor) {
    const inputReceiver = useMemo(() => {
        return new InputReceiver(editor);
    }, [editor]);

    useEffect(() => {
        return () => {
            inputReceiver.dispose();
        };
    }, [inputReceiver]);

    return inputReceiver;
}
