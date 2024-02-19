import { DocNode } from './DocNode';
import { assert } from '../../lib/assert';
import { createPoint, Point } from '../Point';
import { ParagraphNode } from './ContainerNode';

export class TextNode extends DocNode {
    constructor(public text: string) {
        super();
    }

    clone() {
        return new TextNode(this.text);
    }

    get length(): number {
        return this.text.length;
    }

    insertText(offset: number, text: string): { from: Point; to: Point } {
        assert(offset >= 0 && offset <= this.text.length, 'Offset is out of range');
        this.text = this.text.substring(0, offset) + text + this.text.substring(offset);

        return {
            from: createPoint(this, offset),
            to: createPoint(this, offset + text.length),
        };
    }

    insertParagraph(offset: number): { from: Point; to: Point } {
        const paragraph = this.findAncestor((node) => node instanceof ParagraphNode);
        if (paragraph === null)
            return {
                from: createPoint(this, offset),
                to: createPoint(this, offset),
            };

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

        return {
            from: createPoint(this, offset),
            to: createPoint(newText, 0),
        };
    }

    deleteContent(start: number, end: number): { point: Point; contents: DocNode[] } {
        assert(start >= 0 && start <= this.text.length, `Start:${start} is out of range:[0, ${this.text.length}}`);
        assert(end >= 0 && end <= this.text.length, `End:${end} is out of range:[0, ${this.text.length}}`);
        assert(start <= end, `Start:${start} is greater than end:${end}`);

        if (start === 0 && end === this.length && this.parent !== null) {
            const offset = this.parent.children.indexOf(this);
            return this.parent.deleteContent(offset, offset + 1);
        }

        const deletedText = this.text.substring(start, end);
        this.text = this.text.substring(0, start) + this.text.substring(end);
        return { point: createPoint(this, start), contents: [new TextNode(deletedText)] };
    }

    deleteContentBackward(offset: number): { point: Point; contents: DocNode[] } {
        assert(offset >= 0 && offset <= this.length, `Offset ${offset} is out of range: [0, ${this.length}]`);
        return offset === 0 ? this.deleteBegin() : this.deleteContent(offset - 1, offset);
    }

    deleteContentForward(offset: number): { point: Point; contents: DocNode[] } {
        assert(offset >= 0 && offset <= this.length, `Offset ${offset} is out of range: [0, ${this.length}]`);
        return offset === this.length ? this.deleteEnd() : this.deleteContent(offset, offset + 1);
    }

    deleteEnd(): { point: Point; contents: DocNode[] } {
        return (
            this.next?.deleteContentForward(0) ??
            this.parent?.deleteEnd() ?? { point: createPoint(this, this.length), contents: [] }
        );
    }

    deleteBegin(): { point: Point; contents: DocNode[] } {
        return (
            this.prev?.deleteContentBackward(this.prev.length) ??
            this.parent?.deleteBegin() ?? { point: createPoint(this, 0), contents: [] }
        );
    }

    mergeWithNext(): { point: Point; contents: DocNode[] } {
        if (!this.next) return { point: createPoint(this, this.length), contents: [] };
        if (!(this.next instanceof TextNode)) return { point: createPoint(this, this.length), contents: [] };

        const originalLength = this.length;
        this.text = this.text + this.next.text;
        this.next.remove();

        return { point: createPoint(this, originalLength), contents: [new TextNode(''), new TextNode('')] };
    }

    getLayoutLevel(): 'block' | 'inline' {
        return 'inline';
    }

    getContainerType(): 'void' | 'mayBeEmpty' | 'mustNotBeEmpty' {
        return 'void';
    }

    dump(): unknown {
        return {
            id: this.id,
            type: this.constructor.name,
            text: this.text,
        };
    }
}
