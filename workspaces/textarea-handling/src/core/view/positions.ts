import { clamp } from '../../lib/clamp';
import { Cursor } from '../model/Cursor';

// TODO: Terminologyの整理

export function getFocusState(element: Element | null) {
    if (element === null) return false;
    if (!element.ownerDocument?.hasFocus()) return false;

    const activeElement = element.ownerDocument?.activeElement ?? null;
    return element === activeElement || element.contains(activeElement);
}

export function setRangeToDOM(root: HTMLElement, cursor: Cursor) {
    const selection = document.getSelection();
    if (selection === null) return;

    const oldRange = selection.rangeCount === 0 ? null : selection.getRangeAt(0);

    const anchor = getNodeByOffset(root, cursor.anchor);
    const focus = getNodeByOffset(root, cursor.focus);
    if (anchor === null || focus === null) return;

    if (
        oldRange !== null &&
        oldRange.startContainer === anchor.node &&
        oldRange.startOffset === anchor.offset &&
        oldRange.endContainer === focus.node &&
        oldRange.endOffset === focus.offset
    ) {
        return;
    }

    const newRange = document.createRange();
    newRange.setStart(anchor.node, anchor.offset);
    newRange.setEnd(focus.node, focus.offset);

    selection.removeAllRanges();
    selection.addRange(newRange);
}

export function getRangeFromDOM(): { anchor: number; focus: number } | null {
    const selection = document.getSelection();
    if (selection === null || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const anchorOffset = getOffset(range.startContainer, range.startOffset);
    const focusOffset = getOffset(range.endContainer, range.endOffset);
    if (anchorOffset === null || focusOffset === null) return null;

    return {
        anchor: anchorOffset,
        focus: focusOffset,
    };
}

export function getRangeFromNode(node: Node): { from: number; to: number } | null {
    if (!(node instanceof HTMLElement)) return null;

    const rangeFromStr = node.dataset['from'];
    const rangeToStr = node.dataset['to'];
    if (rangeFromStr === undefined || rangeToStr === undefined) return null;

    return { from: +rangeFromStr, to: +rangeToStr };
}

export function getOffset(node: Node, offset: number): number | null {
    if (node instanceof Text) {
        const element = node.parentElement;
        if (element === null) return null;

        const range = getRangeFromNode(element);
        if (range === null) return null;

        return clamp(range.from + offset, range.from, range.to);
    }

    if (node instanceof HTMLElement) {
        if (offset < node.childNodes.length) {
            return getOffset(node.childNodes[offset], 0);
        }
        const lastChild = node.lastChild;
        if (lastChild === null) return null;

        if (lastChild instanceof HTMLElement) {
            const range = getRangeFromNode(lastChild);
            if (range !== null) return range.to;

            return getOffset(lastChild, lastChild.childNodes.length);
        }
        return null;
    }

    return null;
}

export function getNodeByOffset(root: HTMLElement, offset: number): { node: Node; offset: number } | null {
    const range = getRangeFromNode(root);
    if (range !== null) {
        if (!(range.from <= offset && offset <= range.to)) return null;

        const childNode = root.firstChild;
        if (childNode === null && offset === range.from) {
            return { node: root, offset: 0 };
        }
        if (!(childNode instanceof Text)) return null;

        return { node: childNode, offset: clamp(offset - range.from, 0, range.to - range.from) };
    }

    for (const child of Array.from(root.children)) {
        if (!(child instanceof HTMLElement)) continue;
        const result = getNodeByOffset(child, offset);
        if (result !== null) return result;
    }

    return null;
}
