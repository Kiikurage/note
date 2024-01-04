import { Path } from '../../core/common/Node';
import { Cursor, Position } from '../../core/common/Cursor';
import { clamp } from '../../lib/clamp';
import { assert } from '../../lib';

// TODO: Terminologyの整理

export function getFocusState(element: Element | null) {
    if (element === null) return false;
    if (!element.ownerDocument?.hasFocus()) return false;

    const activeElement = element.ownerDocument?.activeElement ?? null;
    return element === activeElement || element.contains(activeElement);
}

export function readPathFromDatasetAttr(node: Node): Path | null {
    if (!(node instanceof HTMLElement)) return null;

    const pathStr = node.dataset['path'];
    if (pathStr === undefined) return null;

    return Path.parse(pathStr);
}

export function isTextElement(node: Node): boolean {
    return readPathFromDatasetAttr(node) !== null;
}

export function readLengthFromDatasetAttr(node: Node): number | null {
    if (!(node instanceof HTMLElement)) return null;

    const lengthStr = node.dataset['length'];
    if (lengthStr === undefined) return null;

    return +lengthStr;
}

export function getPath(node: Node): Path {
    let nodeOrNull: Node | null = node;

    while (nodeOrNull !== null) {
        const path = readPathFromDatasetAttr(nodeOrNull);
        if (path !== null) {
            return path;
        }
        nodeOrNull = nodeOrNull.parentNode;
    }

    return Path.ROOT;
}

export function getPosition(node: Node, offset: number): Position {
    const path = getPath(node);
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
    return root.querySelector(`[data-path="${path}"]`) ?? root.querySelector(`[data-path="${path}"]`);
}

export function getElementByPosition(root: HTMLElement, position: Position): { node: Node; offset: number } | null {
    const element = getElementByPath(root, position.path);
    if (element === null) return null;

    if (isTextElement(element)) {
        if (element.hasChildNodes()) {
            return { node: element.childNodes[0], offset: position.offset };
        } else {
            assert(position.offset === 0, 'offset must be 0');
            return { node: element, offset: 0 };
        }
    } else {
        const node = element.parentElement;
        assert(node !== null, 'node must not be null');

        const offset = Array.from(node.children).indexOf(element);
        assert(offset !== -1, 'offset must not be -1');

        return { node, offset };
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

    console.group('getSelectionFromDOM');
    console.log(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
    console.groupEnd();
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

    console.group('setSelectionToDOM');
    console.log(anchorElement.node, anchorElement.offset, focusElement.node, focusElement.offset);
    console.groupEnd();
    selection.setBaseAndExtent(anchorElement.node, anchorElement.offset, focusElement.node, focusElement.offset);
}
