/**
 * From given element, find the text node which includes the character at the given offset.
 */
export function findTextNode(element: Element, offset: number): Node | undefined {
    const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        const length = node.nodeValue?.length ?? 0;
        if (offset <= length) {
            return node;
        }
        offset -= length;
        node = walker.nextNode();
    }
    return undefined;
}
