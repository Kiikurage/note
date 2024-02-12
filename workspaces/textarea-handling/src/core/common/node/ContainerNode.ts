import { DeleteContentResult, DocNode, InsertContentResult, MergeContentResult } from './DocNode';
import { assert } from '../../../lib/assert';
import { TextNode } from './TextNode';
import { Position } from '../Position';

export class ContainerNode extends DocNode {
    insertText(offset: number, text: string): InsertContentResult {
        assert(offset >= 0 && offset <= this.children.length, 'Offset is out of range');

        const nextNode = this.children[offset];
        if (nextNode instanceof ParagraphNode) {
            return nextNode.insertText(0, text);
        }

        const prevNode = this.children[offset - 1];
        if (prevNode instanceof ParagraphNode) {
            return prevNode.insertText(prevNode.children.length, text);
        }

        const paragraphNode = new ParagraphNode();
        this.insertChild(offset, paragraphNode);

        return paragraphNode.insertText(0, text);
    }

    deleteContent(start: number, end: number): DeleteContentResult {
        assert(
            start >= 0 && start <= this.children.length,
            `Start:${start} is out of range:[0, ${this.children.length}}`,
        );
        assert(end >= 0 && end <= this.children.length, `End:${end} is out of range:[0, ${this.children.length}}`);
        assert(start <= end, `Start:${start} is greater than end:${end}`);

        this.children.slice(start, end).forEach((node) => node.remove());
        return { positionAfterDeletion: Position.of(this, start) };
    }

    deleteContentBackward(offset: number): DeleteContentResult {
        assert(offset >= 0 && offset <= this.length, `Offset ${offset} is out of range: [0, ${this.length}]`);
        if (offset === 0) return this.deleteBegin();

        const child = this.children[offset - 1];
        return child.deleteContentBackward(child.length);
    }

    deleteContentForward(offset: number): DeleteContentResult {
        assert(offset >= 0 && offset <= this.length, `Offset ${offset} is out of range: [0, ${this.length}]`);
        if (offset === this.length) return this.deleteEnd();

        const child = this.children[offset];
        return child.deleteContentForward(0);
    }

    deleteEnd(): DeleteContentResult {
        if (this.next) {
            const result = this.mergeWithNext();
            return { positionAfterDeletion: result.mergedPosition };
        } else {
            return this.parent?.deleteEnd() ?? { positionAfterDeletion: Position.of(this, this.length) };
        }
    }

    deleteBegin(): DeleteContentResult {
        if (this.prev) {
            const result = this.prev.mergeWithNext();
            return { positionAfterDeletion: result.mergedPosition };
        } else {
            return this.parent?.deleteBegin() ?? { positionAfterDeletion: Position.of(this, 0) };
        }
    }

    mergeWithNext(): MergeContentResult {
        if (!this.next) return { mergedPosition: Position.of(this, this.length) };
        if (this.constructor !== this.next.constructor) return { mergedPosition: Position.of(this, this.length) };

        const originalLength = this.length;
        const originalLastChild = this.children.at(-1);
        this.next.children.forEach((child) => this.insertLast(child));
        this.next.remove();

        return originalLastChild?.mergeWithNext() ?? { mergedPosition: Position.of(this, originalLength) };
    }

    insertParagraph(offset: number): InsertContentResult {
        return { positionAfterInsertion: Position.of(this, offset) };
    }
}

export class ParagraphNode extends ContainerNode {
    insertText(offset: number, text: string): InsertContentResult {
        assert(offset >= 0 && offset <= this.children.length, 'Offset is out of range');

        const nextNode = this.children[offset];
        if (nextNode instanceof TextNode) {
            return nextNode.insertText(0, text);
        }

        const prevNode = this.children[offset - 1];
        if (prevNode instanceof TextNode) {
            return prevNode.insertText(prevNode.text.length, text);
        }

        const textNode = new TextNode(text);
        this.insertChild(offset, textNode);

        return { positionAfterInsertion: Position.of(textNode, text.length) };
    }

    insertParagraph(offset: number): InsertContentResult {
        const newParagraph = new ParagraphNode();
        this.insertAfter(newParagraph);
        this.children.slice(offset).forEach((child) => newParagraph.insertLast(child));

        return { positionAfterInsertion: Position.of(newParagraph, 0) };
    }
}
