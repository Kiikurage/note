import { DeleteContentResult, InsertContentResult } from './DocNode';
import { Position } from '../Position';
import { ContainerNode, ParagraphNode } from './ContainerNode';

export class RootNode extends ContainerNode {
    deleteEnd(): DeleteContentResult {
        // Do nothing
        return { positionAfterDeletion: Position.of(this, this.length) };
    }

    insertParagraph(offset: number): InsertContentResult {
        if (this.children.length === 0) {
            this.insertLast(new ParagraphNode());
            return this.insertParagraph(0);
        }

        this.insertChild(offset, new ParagraphNode());

        return { positionAfterInsertion: Position.of(this, offset + 1) };
    }
}
