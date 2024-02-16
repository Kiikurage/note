import { ComponentType, createElement, ReactNode } from 'react';
import { DocNode, NodeConstructor, NodeTypeOf } from '../core/node/DocNode';
import { throwError } from '../lib/throwError';
import { registerComponent } from '../core/Editor';
import { TextNode } from '../core/node/TextNode';
import { TextNodeView } from './view/TextNodeView';
import { ParagraphNode } from '../core/node/ContainerNode';
import { ParagraphNodeView } from './view/ParagraphNodeView';
import { RootNode } from '../core/node/RootNode';
import { RootNodeView } from './view/RootNodeView';

export type ReactNodeComponentType<T extends DocNode = DocNode> = ComponentType<{ node: T }>;

export class ReactComponentTypeMap {
    private readonly map = new Map<NodeConstructor, ReactNodeComponentType>();
    static readonly ComponentKey = registerComponent(() => new ReactComponentTypeMap());

    constructor() {
        this.register(TextNode, TextNodeView)
            .register(ParagraphNode, ParagraphNodeView)
            .register(RootNode, RootNodeView);
    }

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
        return node.children.map((node) => this.render(node));
    }
}
