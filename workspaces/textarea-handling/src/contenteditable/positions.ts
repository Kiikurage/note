import { Cursor } from '../core/Cursor';
import { clamp } from '../lib/clamp';
import { assert } from '../lib';
import { Position } from '../core/Position';
import { NodeId } from '../core/Node';
import { Logger } from '../lib/logger';

export function readLengthFromDatasetAttr(node: Node): number | null {
    if (!(node instanceof HTMLElement)) return null;

    const lengthStr = node.dataset['length'];
    if (lengthStr === undefined) return null;

    return +lengthStr;
}

export function readNodeIdFromDatasetAttr(node: Node): NodeId | null {
    if (!(node instanceof HTMLElement)) return null;

    const nodeId = node.dataset['nodeId'];
    if (nodeId === undefined) return null;

    return +nodeId;
}

export function isTextNode(node: Node): boolean {
    return readLengthFromDatasetAttr(node) !== null;
}

export function getNodeId(node: Node): NodeId | null {
    let nodeOrNull: Node | null = node;

    while (nodeOrNull !== null) {
        const nodeId = readNodeIdFromDatasetAttr(nodeOrNull);
        if (nodeId !== null) {
            return nodeId;
        }
        nodeOrNull = nodeOrNull.parentNode;
    }

    return null;
}

export function getPosition(node: Node, offset: number): Position | null {
    const nodeId = getNodeId(node);
    if (nodeId === null) return null;

    if (node instanceof Text) {
        const parent = node.parentElement;
        if (parent !== null) {
            const length = readLengthFromDatasetAttr(parent);
            if (length !== null) {
                return new Position({ nodeId, offset: clamp(offset, 0, length) });
            }
        }
    }

    return new Position({ nodeId, offset: 0 });
}

export function getElementByNodeId(root: HTMLElement, nodeId: NodeId): Element | null {
    return root.querySelector(`[data-node-id="${nodeId}"]`);
}

export function getElementByPosition(root: HTMLElement, position: Position): { node: Node; offset: number } | null {
    const element = getElementByNodeId(root, position.nodeId);
    if (element === null) return null;

    if (isTextNode(element)) {
        if (element.hasChildNodes()) {
            return { node: element.childNodes[0], offset: position.offset };
        } else {
            assert(position.offset === 0, 'offset must be 0');
            return { node: element, offset: 0 };
        }
    } else {
        return { node: element, offset: position.offset };
    }
}

export function getSelectionFromDOM(root: HTMLElement): { anchor: Position; focus: Position } | null {
    const selection = root.ownerDocument.getSelection();
    if (selection === null) return null;

    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    if (anchorNode === null || focusNode === null) return null;

    const anchor = getPosition(anchorNode, selection.anchorOffset);
    const focus = getPosition(focusNode, selection.focusOffset);
    if (anchor === null || focus === null) return null;

    return { anchor, focus };
}

export function setSelectionToDOM(root: HTMLElement, cursor: Cursor) {
    const anchorElement = getElementByPosition(root, cursor.anchor);
    const focusElement = getElementByPosition(root, cursor.focus);
    if (anchorElement === null || focusElement === null) return;

    const selection = root.ownerDocument.getSelection();
    if (selection === null) return;

    if (
        selection.anchorNode === anchorElement.node &&
        selection.anchorOffset === anchorElement.offset &&
        selection.focusNode === focusElement.node &&
        selection.focusOffset === focusElement.offset
    ) {
        return;
    }

    selection.setBaseAndExtent(anchorElement.node, anchorElement.offset, focusElement.node, focusElement.offset);
}

const logger = new Logger('positions');
