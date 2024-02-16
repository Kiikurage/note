import { DeleteContentResult, InsertContentResult } from './DocNode';
import { createPoint } from '../Point';
import { ContainerNode, ParagraphNode } from './ContainerNode';

export class RootNode extends ContainerNode {
    deleteEnd(): DeleteContentResult {
        // Do nothing
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
