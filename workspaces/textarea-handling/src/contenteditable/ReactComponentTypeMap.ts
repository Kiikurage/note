import { DIContainer } from '../lib/DIContainer';
import { Node, NodeConstructor, NodeId, NodeTypeOf } from '../core/Node';
import { ComponentType, createElement, ReactNode } from 'react';
import { DefaultNodeView } from './nodeView/DefaultNodeView';
import { Doc } from '../core/Doc';

export type NodeComponentType<T extends Node = Node> = ComponentType<{ node: T }>;

export class ReactComponentTypeMap {
    private readonly map = new Map<NodeConstructor, NodeComponentType>();
    static readonly ServiceKey = DIContainer.register(() => new ReactComponentTypeMap());

    register<T extends NodeConstructor>(nodeConstructor: T, componentType: NodeComponentType<NodeTypeOf<T>>): this {
        this.map.set(nodeConstructor, componentType as NodeComponentType);
        return this;
    }

    render<T extends Node>(node: T) {
        const type = (this.map.get(node.constructor as NodeConstructor) ?? DefaultNodeView) as NodeComponentType<T>;

        return createElement(type, { node, key: node.id });
    }

    renderChildren(nodeId: NodeId, doc: Doc): ReactNode[] {
        const children = doc.childIds(nodeId);
        if (children.length === 0) return [JOINER];

        return doc.children(nodeId).map((node) => this.render(node));
    }
}

const JOINER = '\u2060';
