import { useService } from '../DIContainerProvider';
import { ReactComponentTypeMap } from '../ReactComponentTypeMap';
import { useEditorState } from '../useEditorState';
import { Editor } from '../../core/Editor';
import { Node } from '../../core/interfaces';
import { Attributes, createElement, ReactNode } from 'react';

export const NodeChildren = ({ parent }: { parent: Node }) => {
    const componentMap = useService(ReactComponentTypeMap.ServiceKey);
    const editor = useService(Editor.ServiceKey);
    const editorState = useEditorState(editor);

    return componentMap.renderChildren(parent.id, editorState.doc);
};
