import { useSyncExternalStore } from 'react';
import { Editor } from './common/Editor';

export function useEditorState(editor: Editor) {
    return useSyncExternalStore(
        (callback) => {
            editor.onChange.addListener(callback);
            return () => editor.onChange.removeListener(callback);
        },
        () => editor.state,
    );
}
