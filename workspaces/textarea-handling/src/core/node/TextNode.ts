import { DeleteContentResult, DocNode, InsertContentResult, MergeContentResult } from './DocNode';
import { assert } from '../../lib/assert';
import { createPoint } from '../Point';
import { ParagraphNode } from './ContainerNode';

export class TextNode extends DocNode {
    constructor(public text: string) {
        super();
    }

    get length(): number {
        return this.text.length;
    }

    insertText(offset: number, text: string): InsertContentResult {
        assert(offset >= 0 && offset <= this.text.length, 'Offset is out of range');
        this.text = this.text.substring(0, offset) + text + this.text.substring(offset);

        return { pointAfterInsertion: createPoint(this, offset + text.length) };
    }

    insertParagraph(offset: number): InsertContentResult {
        const paragraph = this.findAncestor((node) => node instanceof ParagraphNode);
        if (paragraph === null) return { pointAfterInsertion: createPoint(this, offset) };

        const textNodeOffset = paragraph.children.indexOf(this);
        assert(textNodeOffset !== -1, 'Text node should be a child of paragraph');

        if (offset === 0) return paragraph.insertParagraph(textNodeOffset);
        if (offset === this.length) return paragraph.insertParagraph(textNodeOffset + 1);

        const newText = new TextNode(this.text.substring(offset));
        this.text = this.text.substring(0, offset);
        this.insertAfter(newText);

        const newParagraph = new ParagraphNode();
        paragraph.insertAfter(newParagraph);
        paragraph.children.slice(textNodeOffset + 1).forEach((child) => newParagraph.insertLast(child));

        return { pointAfterInsertion: createPoint(newText, 0) };
    }

    deleteContent(start: number, end: number): DeleteContentResult {
        assert(start >= 0 && start <= this.text.length, `Start:${start} is out of range:[0, ${this.text.length}}`);
        assert(end >= 0 && end <= this.text.length, `End:${end} is out of range:[0, ${this.text.length}}`);
        assert(start <= end, `Start:${start} is greater than end:${end}`);

        if (start === 0 && end === this.length && this.parent !== null) {
            const offset = this.parent.children.indexOf(this);
            return this.parent.deleteContent(offset, offset + 1);
        }

        this.text = this.text.substring(0, start) + this.text.substring(end);
        return { pointAfterDeletion: createPoint(this, start) };
    }

    deleteContentBackward(offset: number): DeleteContentResult {
        assert(offset >= 0 && offset <= this.length, `Offset ${offset} is out of range: [0, ${this.length}]`);
        return offset === 0 ? this.deleteBegin() : this.deleteContent(offset - 1, offset);
    }

    deleteContentForward(offset: number): DeleteContentResult {
        assert(offset >= 0 && offset <= this.length, `Offset ${offset} is out of range: [0, ${this.length}]`);
        return offset === this.length ? this.deleteEnd() : this.deleteContent(offset, offset + 1);
    }

    deleteEnd(): DeleteContentResult {
        return (
            this.next?.deleteContentForward(0) ??
            this.parent?.deleteEnd() ?? { pointAfterDeletion: createPoint(this, this.length) }
        );
    }

    deleteBegin(): DeleteContentResult {
        return (
            this.prev?.deleteContentBackward(this.prev.length) ??
            this.parent?.deleteBegin() ?? { pointAfterDeletion: createPoint(this, 0) }
        );
    }

    mergeWithNext(): MergeContentResult {
        if (!this.next) return { mergedPoint: createPoint(this, this.length) };
        if (!(this.next instanceof TextNode)) return { mergedPoint: createPoint(this, this.length) };

        const originalLength = this.length;
        this.text = this.text + this.next.text;
        this.next.remove();

        return { mergedPoint: createPoint(this, originalLength) };
    }
}
