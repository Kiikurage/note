import { DIContainer } from '../../lib/DIContainer';
import { ComponentType, createElement, ReactNode } from 'react';
import { DocNode, NodeConstructor, NodeTypeOf } from '../common/node/DocNode';
import { throwError } from '../../lib/throwError';

export type ReactNodeComponentType<T extends DocNode = DocNode> = ComponentType<{ node: T }>;

export class ReactComponentTypeMap {
    private readonly map = new Map<NodeConstructor, ReactNodeComponentType>();
    static readonly ServiceKey = DIContainer.register(() => new ReactComponentTypeMap());

    register<T extends NodeConstructor>(
        nodeConstructor: T,
        componentType: ReactNodeComponentType<NodeTypeOf<T>>,
    ): this {
        this.map.set(nodeConstructor, componentType as ReactNodeComponentType);
        return this;
    }

    render<T extends DocNode>(node: T) {
        const type = (this.map.get(node.constructor as NodeConstructor) ??
            throwError(`React component for ${node.constructor.name} is not registered`)) as ReactNodeComponentType<T>;

        return createElement(type, { node, key: node.id });
    }

    renderChildren(node: DocNode): ReactNode[] {
        // if (node.children.length === 0) return [JOINER];

        return node.children.map((node) => this.render(node));
    }
}

// const JOINER = '\u2060';
