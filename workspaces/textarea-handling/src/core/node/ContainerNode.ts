import { DocNode } from './DocNode';
import { assert } from '../../lib/assert';
import { TextNode } from './TextNode';
import { createPoint, Point } from '../Point';

export class ContainerNode extends DocNode {
    clone(): DocNode {
        return new ContainerNode();
    }

    insertText(offset: number, text: string): { from: Point; to: Point } {
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

    deleteContent(start: number, end: number): { point: Point; contents: DocNode[] } {
        assert(
            start >= 0 && start <= this.children.length,
            `Start:${start} is out of range:[0, ${this.children.length}}`,
        );
        assert(end >= 0 && end <= this.children.length, `End:${end} is out of range:[0, ${this.children.length}}`);
        assert(start <= end, `Start:${start} is greater than end:${end}`);

        const removedChildren = this.children.slice(start, end);
        removedChildren.forEach((node) => node.remove());

        return { point: createPoint(this, start), contents: removedChildren };
    }

    deleteContentBackward(offset: number): { point: Point; contents: DocNode[] } {
        assert(offset >= 0 && offset <= this.length, `Offset ${offset} is out of range: [0, ${this.length}]`);
        if (offset === 0) return this.deleteBegin();

        const child = this.children[offset - 1];
        return child.deleteContentBackward(child.length);
    }

    deleteContentForward(offset: number): { point: Point; contents: DocNode[] } {
        assert(offset >= 0 && offset <= this.length, `Offset ${offset} is out of range: [0, ${this.length}]`);
        if (offset === this.length) return this.deleteEnd();

        const child = this.children[offset];
        return child.deleteContentForward(0);
    }

    deleteEnd(): { point: Point; contents: DocNode[] } {
        if (this.next) {
            return this.mergeWithNext();
        } else {
            return this.parent?.deleteEnd() ?? { point: createPoint(this, this.length), contents: [] };
        }
    }

    deleteBegin(): { point: Point; contents: DocNode[] } {
        if (this.prev) {
            return this.prev.mergeWithNext();
        } else {
            return this.parent?.deleteBegin() ?? { point: createPoint(this, 0), contents: [] };
        }
    }

    mergeWithNext(): { point: Point; contents: DocNode[] } {
        if (!this.next) return { point: createPoint(this, this.length), contents: [] };
        if (!(this.next instanceof ContainerNode)) return { point: createPoint(this, this.length), contents: [] };

        const contents = [this.clone(), this.next.clone()];
        const originalLength = this.length;
        const originalLastChild = this.children.at(-1);
        this.next.children.forEach((child) => this.insertLast(child));
        this.next.remove();

        const childResult = originalLastChild?.mergeWithNext();
        if (childResult === undefined) {
            return { point: createPoint(this, originalLength), contents };
        } else {
            if (childResult.contents.length === 2) {
                contents[0].insertLast(childResult.contents[0]);
                contents[1].insertLast(childResult.contents[1]);
            }

            return { point: childResult.point, contents };
        }
    }

    insertParagraph(offset: number): { from: Point; to: Point } {
        this.insertChild(offset, new ParagraphNode());
        return {
            from: createPoint(this, offset),
            to: createPoint(this, offset + 1),
        };
    }

    getLayoutLevel(): 'block' | 'inline' {
        return 'block';
    }

    getContainerType(): 'void' | 'mayBeEmpty' | 'mustNotBeEmpty' {
        return 'mayBeEmpty';
    }
}

export class ParagraphNode extends ContainerNode {
    clone() {
        return new ParagraphNode();
    }

    insertText(offset: number, text: string): { from: Point; to: Point } {
        assert(offset >= 0 && offset <= this.children.length, 'Offset is out of range');

        const nextNode = this.children[offset];
        if (nextNode instanceof TextNode) {
            return nextNode.insertText(0, text);
        }

        const prevNode = this.children[offset - 1];
        if (prevNode instanceof TextNode) {
            return prevNode.insertText(prevNode.text.length, text);
        }

        const textNode = new TextNode('');
        this.insertChild(offset, textNode);

        return textNode.insertText(0, text);
    }

    insertParagraph(offset: number): { from: Point; to: Point } {
        const newParagraph = new ParagraphNode();
        this.insertAfter(newParagraph);
        this.children.slice(offset).forEach((child) => newParagraph.insertLast(child));

        return {
            from: createPoint(this, offset),
            to: createPoint(newParagraph, 0),
        };
    }
}
