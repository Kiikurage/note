import { DocNode } from './DocNode';
import { createPoint, Point } from '../Point';
import { ContainerNode, ParagraphNode } from './ContainerNode';

export class RootNode extends ContainerNode {
    clone(): DocNode {
        return new RootNode();
    }

    deleteBegin(): { point: Point; contents: DocNode[] } {
        return { point: createPoint(this, 0), contents: [] };
    }

    deleteEnd(): { point: Point; contents: DocNode[] } {
        return { point: createPoint(this, this.length), contents: [] };
    }

    insertParagraph(offset: number): { from: Point; to: Point } {
        if (this.children.length === 0) {
            this.insertLast(new ParagraphNode());
            return this.insertParagraph(0);
        }

        this.insertChild(offset, new ParagraphNode());

        return {
            from: createPoint(this, offset),
            to: createPoint(this, offset + 1),
        };
    }
}
