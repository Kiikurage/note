import { useService } from '../EditorView';
import { ReactComponentTypeMap } from '../ReactComponentTypeMap';
import { DocNode } from '../../common/node/DocNode';

export const NodeChildren = ({ parent }: { parent: DocNode }) => {
    const componentMap = useService(ReactComponentTypeMap.ComponentKey);

    if (parent.children.length === 0) return <br />;

    return componentMap.renderChildren(parent);
};
