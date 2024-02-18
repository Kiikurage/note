import { DeleteContentResult, DocNode, InsertContentResult } from './DocNode';
import { createPoint } from '../Point';
import { ContainerNode, ParagraphNode } from './ContainerNode';

export class RootNode extends ContainerNode {
    clone(): DocNode {
        return new RootNode();
    }

    deleteBegin(): DeleteContentResult {
        return { pointAfterDeletion: createPoint(this, 0) };
    }

    deleteEnd(): DeleteContentResult {
        return { pointAfterDeletion: createPoint(this, this.length) };
    }

    insertParagraph(offset: number): InsertContentResult {
        if (this.children.length === 0) {
            this.insertLast(new ParagraphNode());
            return this.insertParagraph(0);
        }

        this.insertChild(offset, new ParagraphNode());

        return { pointAfterInsertion: createPoint(this, offset + 1) };
    }
}
