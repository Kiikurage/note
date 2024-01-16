import { Position } from '../Position';
import { ContainerNode } from './ContainerNode';
import { Logger } from '../../lib/logger';
import { Doc, InsertTextResult } from '../interfaces';
import { TextNode } from './TextNode';

export abstract class InlineNode<Props = void> extends ContainerNode<Props> {
    insertText(doc: Doc, offset: number, text: string): InsertTextResult {
        const nextChild = doc.getByPositionOrNull(Position.of(this.id, offset));
        if (nextChild !== null) {
            const result = nextChild.insertText(doc, 0, text);
            if (result.doc !== doc) return result;
        }

        if (offset > 0) {
            const prevChild = doc.prevPositionNodeOrNull(Position.of(this.id, offset - 1));
            if (prevChild !== null) {
                const result = prevChild.insertText(doc, doc.length(prevChild.id), text);
                if (result.doc !== doc) return result;
            }
        }

        const textNode = new TextNode({ text });
        return {
            doc: doc.insertByPosition(Position.of(this.id, offset), textNode),
            from: Position.of(textNode.id),
            to: Position.of(textNode.id, text.length),
        };
    }
}

const logger = Logger.of(TextNode);
