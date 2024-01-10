import { Node } from '../core/Node';
import { useService } from './DIContainerProvider';
import { ReactComponentTypeMap } from './ReactComponentTypeMap';
import { useEditorState } from './useEditorState';
import { Editor } from '../core/Editor';

export const NodeChildren = ({ parent }: { parent: Node }) => {
    const componentMap = useService(ReactComponentTypeMap.ServiceKey);
    const editor = useService(Editor.ServiceKey);
    const editorState = useEditorState(editor);

    return componentMap.renderChildren(parent.id, editorState.doc);
};
