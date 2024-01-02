import { createContext, ReactNode, useContext, useMemo } from 'react';
import { Editor } from '../model/Editor';
import { DIContainer } from '../../lib/DIContainer';

export interface EditorContext {
    editor: Editor;
}

const context = createContext<EditorContext>(null as never);

export const EditorProvider = ({ editor: _editor, children }: { editor?: Editor; children?: ReactNode }) => {
    const editor = useMemo(() => {
        if (_editor !== undefined) return _editor;

        return new DIContainer().get(Editor.ServiceKey);
    }, [_editor]);

    return <context.Provider value={{ editor }}>{children}</context.Provider>;
};

export function useEditorContext() {
    return useContext(context);
}

export function useEditor() {
    return useEditorContext().editor;
}
