import { ContainerNode } from './ContainerNode';
import { DeleteResult, Doc } from '../interfaces';
import { Position } from '../Position';

export class RootNode extends ContainerNode {
    deleteContentBackward(doc: Doc, offset: number): DeleteResult {
        if (offset === 0) return { doc, from: Position.of(this.id, offset), to: Position.of(this.id, offset) };
        return super.deleteContentBackward(doc, offset);
    }

    deleteContentForward(doc: Doc, offset: number): DeleteResult {
        if (offset === doc.length(this.id))
            return { doc, from: Position.of(this.id, offset), to: Position.of(this.id, offset) };
        return super.deleteContentBackward(doc, offset);
    }
}
