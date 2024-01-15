import { AbstractNode } from './AbstractNode';
import { Position } from '../Position';
import { ParagraphNode } from './ContainerNode';
import { Logger } from '../../lib/logger';
import {
    DeleteResult,
    Doc,
    InsertNodeResult,
    InsertTextResult,
    MergeResult,
    Node,
    NodeId,
    SplitResult,
} from '../interfaces';
import { assert } from '../../lib/assert';

interface Props {
    text: string;
}

export class TextNode extends AbstractNode<Props> {
    constructor(props: Props, id?: NodeId) {
        super(props, id);
        assert(this.text !== '', 'TextNode.text must not be empty');
    }

    get text(): string {
        return this.props.text;
    }

    length(doc: Doc): number {
        return this.text.length;
    }

    split(doc: Doc, position: Position): SplitResult {
        assert(position.nodeId === this.id, 'position.nodeId === this.id');

        if (position.offset === 0) return { doc, left: null, right: this };
        if (position.offset === this.text.length) return { doc, left: this, right: null };

        const left = this.setText(this.text.slice(0, position.offset));
        if (left === null) return { doc, left: null, right: this };

        const right = this.copy({ text: this.text.slice(position.offset) }, Node.generateId());
        if (right === null) return { doc, left: this, right: null };

        return { doc: doc.replace(this.id, left).insertAfter(this.id, right), left, right };
    }

    merge(doc: Doc): MergeResult {
        const nextNode = doc.nextSiblingNodeOrNull(this.id);
        if (!(nextNode instanceof TextNode)) return { doc, position: doc.endPosition(this.id) };

        const merged = this.setText(this.text + nextNode.text);
        assert(merged !== null, 'merged !== null');

        return {
            doc: doc.replace(this.id, merged).delete(nextNode.id).doc,
            position: Position.of(this.id, this.text.length),
        };
    }

    insertText(doc: Doc, offset: number, text: string): InsertTextResult {
        const node = this.splice(offset, 0, text);
        if (node === null) {
            return {
                doc,
                from: Position.of(this.id, offset),
                to: Position.of(this.id, offset),
            };
        }

        return {
            doc: doc.replace(this.id, node),
            from: Position.of(this.id, offset),
            to: Position.of(this.id, offset + text.length),
        };
    }

    insertParagraph(doc: Doc, offset: number): InsertNodeResult {
        const paragraphNode = doc.findAncestor(this.id, (node) => node instanceof ParagraphNode);
        assert(paragraphNode !== null, 'paragraphNode !== null');

        const result = paragraphNode.split(doc, Position.of(this.id, offset));
        doc = result.doc;

        if (result.right === null) {
            const paragraph = new ParagraphNode();
            doc = doc.insertAfter(paragraphNode.id, paragraph);
            return { doc, nodeId: paragraph.id };
        }

        return { doc: result.doc, nodeId: result.right.id };
    }

    deleteContentBackward(doc: Doc, offset: number): DeleteResult {
        if (offset > 0) return this.deleteByOffsetRange(doc, offset - 1, offset);

        const parent = doc.parent(this.id);
        return parent.deleteContentBackward(doc, doc.offset(this.id));
    }

    deleteContentForward(doc: Doc, offset: number): DeleteResult {
        if (offset < doc.length(this.id)) return this.deleteByOffsetRange(doc, offset, offset + 1);

        const parent = doc.parent(this.id);
        return parent.deleteContentForward(doc, doc.offset(this.id) + 1);
    }

    deleteByOffsetRange(doc: Doc, from: number, to: number): DeleteResult {
        const node = this.splice(from, to - from);

        if (node === null) return doc.delete(this.id);

        doc = doc.replace(this.id, node);
        const position = Position.of(this.id, from);

        return { doc, from: position, to: position };
    }

    private setText(text: string): TextNode | null {
        if (text === this.text) return this;
        if (text === '') return null;

        return this.copy({ text });
    }

    private splice(offset: number, deleteCount: number, text = ''): TextNode | null {
        return this.setText(this.text.slice(0, offset) + text + this.text.slice(offset + deleteCount));
    }
}

const logger = Logger.of(TextNode);
