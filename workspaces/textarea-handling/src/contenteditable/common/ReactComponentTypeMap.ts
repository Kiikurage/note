import { DIContainer } from '../../core/common/DIContainer';
import { Path } from '../../core/common/Path';
import { Node, NodeConstructor, NodeTypeOf } from '../../core/common/Node';
import { ComponentType, createElement } from 'react';
import { DefaultNodeView } from '../DefaultNodeView';

export class ReactComponentTypeMap {
    private readonly map = new Map<
        NodeConstructor,
        ComponentType<{
            node: Node;
            path: Path;
        }>
    >();
    static readonly ServiceKey = DIContainer.register(() => new ReactComponentTypeMap());

    register<T extends NodeConstructor>(
        nodeConstructor: T,
        componentType: ComponentType<{ node: NodeTypeOf<T>; path: Path }>,
    ) {
        this.map.set(nodeConstructor, componentType as ComponentType<{ node: Node; path: Path }>);
    }

    render<T extends Node>(node: T, parentPath: Path) {
        const path = parentPath.child(node.id);
        const type = this.map.get(node.constructor as NodeConstructor) ?? DefaultNodeView;

        return createElement(type, { node, path });
    }
}
