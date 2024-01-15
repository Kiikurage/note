import { DIContainer } from '../lib/DIContainer';
import { ComponentType, createElement, ReactNode } from 'react';
import { DefaultNodeView } from './nodeView/DefaultNodeView';
import { Doc, Node, NodeConstructor, NodeId, NodeTypeOf } from '../core/interfaces';

export type ReactNodeComponentType<T extends Node = Node> = ComponentType<{ node: T }>;

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

    render<T extends Node>(node: T) {
        const type = (this.map.get(node.constructor as NodeConstructor) ??
            DefaultNodeView) as ReactNodeComponentType<T>;

        return createElement(type, { node, key: node.id });
    }

    renderChildren(nodeId: NodeId, doc: Doc): ReactNode[] {
        const children = doc.children(nodeId);
        if (children.length === 0) return [JOINER];

        return children.map((node) => this.render(node));
    }
}

const JOINER = '\u2060';
