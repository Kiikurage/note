import { Cursor } from '../../core/common/core/Cursor';
import { clamp } from '../../lib/clamp';
import { assert } from '../../lib';
import { Path } from '../../core/common/core/Path';
import { Position } from '../../core/common/core/Position';

// TODO: Terminologyの整理

export function getFocusState(element: Element | null) {
    if (element === null) return false;
    if (!element.ownerDocument?.hasFocus()) return false;

    const activeElement = element.ownerDocument?.activeElement ?? null;
    return element === activeElement || element.contains(activeElement);
}

export function readLengthFromDatasetAttr(node: Node): number | null {
    if (!(node instanceof HTMLElement)) return null;

    const lengthStr = node.dataset['length'];
    if (lengthStr === undefined) return null;

    return +lengthStr;
}

export function readPathFromDatasetAttr(node: Node): Path | null {
    if (!(node instanceof HTMLElement)) return null;

    const pathStr = node.dataset['path'];
    if (pathStr === undefined) return null;

    return Path.parse(pathStr);
}

export function isTextNode(node: Node): boolean {
    return readLengthFromDatasetAttr(node) !== null;
}

export function isEditableContentHost(node: Node): boolean {
    if (!(node instanceof HTMLElement)) return false;

    return 'contentEditableHost' in node.dataset;
}

export function getPath(node: Node): Path | null {
    let nodeOrNull: Node | null = node;

    while (nodeOrNull !== null) {
        if (isEditableContentHost(nodeOrNull)) return Path.of();
        const path = readPathFromDatasetAttr(nodeOrNull);
        if (path !== null) {
            return path;
        }
        nodeOrNull = nodeOrNull.parentNode;
    }

    console.error('Failed to identify path');

    return null;
}

export function getPosition(node: Node, offset: number): Position | null {
    const path = getPath(node);
    if (path === null) return null;

    if (node instanceof Text) {
        const parent = node.parentElement;
        if (parent !== null) {
            const length = readLengthFromDatasetAttr(parent);
            if (length !== null) {
                return new Position({ path, offset: clamp(offset, 0, length) });
            }
        }
    }

    return new Position({ path, offset: 0 });
}

export function getElementByPath(root: HTMLElement, path: Path): Element | null {
    return root.querySelector(`[data-path="${path}"]`);
}

export function getElementByPosition(root: HTMLElement, position: Position): { node: Node; offset: number } | null {
    const element = getElementByPath(root, position.path);
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
