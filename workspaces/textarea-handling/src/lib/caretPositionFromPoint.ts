export interface CaretPosition {
    offsetNode: Node;
    offset: number;
}

interface DocumentWithCaretPositionFromPoint {
    caretPositionFromPoint(clientX: number, clientY: number): CaretPosition;
}

export function caretPositionFromPoint(document: Document, clientX: number, clientY: number): CaretPosition | null {
    if ('caretPositionFromPoint' in document) {
        return (document as DocumentWithCaretPositionFromPoint).caretPositionFromPoint(clientX, clientY);
    }

    if ('caretRangeFromPoint' in document) {
        const range = document.caretRangeFromPoint(clientX, clientY);
        if (range === null) return null;

        return {
            offsetNode: range.startContainer,
            offset: range.startOffset,
        };
    }

    return null;
}
