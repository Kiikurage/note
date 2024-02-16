import { createContext, useContext, useRef, useSyncExternalStore } from 'react';
import { Extension } from '../../extension/Extension';
import { ComponentKey, Editor } from '../common/Editor';
import { RootNodeView } from './view/RootNodeView';

const context = createContext<Editor>(null as never);

export const EditorView = ({
    extensions = [],
    editor,
}: {
    extensions?: ComponentKey<Extension>[];
    editor?: Editor;
}) => {
    const editorRef = useRef<Editor | undefined>(editor);
    if (editorRef.current === undefined) {
        const editor = new Editor();
        extensions.forEach((extension) => editor.getComponent(extension));
        editorRef.current = editor;
    }

    const editorState = useSyncExternalStore(
        (callback) => {
            editorRef.current!.onChange.addListener(callback);
            return () => editorRef.current!.onChange.removeListener(callback);
        },
        () => editorRef.current!.state,
    );

    return (
        <context.Provider value={editorRef.current}>
            <RootNodeView node={editorState.root} />
        </context.Provider>
    );
};

export function useEditor() {
    return useContext(context);
}

export function useService<T>(key: ComponentKey<T>) {
    return useEditor().getComponent(key);
}

export function useEditorState() {
    const editor = useEditor();
    return useSyncExternalStore(
        (callback) => {
            editor.onChange.addListener(callback);
            return () => editor.onChange.removeListener(callback);
        },
        () => editor.state,
    );
}
