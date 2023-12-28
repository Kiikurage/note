import { useEffect, useRef } from 'react';
import { Editor } from '../core/Editor';
import { InputReceiver } from './InputReceiver';

export function useInputReceiver(editor: Editor) {
    const inputReceiverRef = useRef<InputReceiver>();
    if (inputReceiverRef.current === undefined) {
        inputReceiverRef.current = new InputReceiver(editor);
    }

    useEffect(() => {
        return () => {
            inputReceiverRef.current?.dispose();
        };
    }, [inputReceiverRef]);

    return inputReceiverRef.current;
}
