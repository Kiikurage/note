import { useEffect, useMemo } from 'react';
import { Editor } from '../core/Editor';
import { InputReceiver } from './InputReceiver';

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
