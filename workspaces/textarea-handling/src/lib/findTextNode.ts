/**
 * From given element, find the text node which includes the character at the given offset.
 */
export function findTextNode(
    element: Element,
    offset: number,
):
    | {
          node: Node;
          offset: number;
      }
    | {
          node: undefined;
          offset: undefined;
      } {
    const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node !== null) {
        const length = node.nodeValue?.length ?? 0;
        if (offset <= length) {
            return { node, offset };
        }
        offset -= length;
        node = walker.nextNode();
    }
    return { node: undefined, offset: undefined };
}
