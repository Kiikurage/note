import { Node } from '../core/Node';
import { Attributes, createElement, ReactNode } from 'react';
import { TextNode } from '../core/node/TextNode';

export const NodeViewBase = <P extends object, T extends keyof HTMLElementTagNameMap>({
    node,
    as,
    children,
    ...props
}: Attributes &
    P & {
        node: Node;
        as: T;
        children?: ReactNode;
    }) =>
    createElement(
        as,
        {
            'data-node-id': node.id,
            'data-node-type': node.type,
            ...props,
        },
        children,
    );
