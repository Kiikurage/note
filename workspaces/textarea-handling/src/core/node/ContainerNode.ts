import { Position } from '../Position';
import { TextNode } from './TextNode';
import { Logger } from '../../lib/logger';
import { AbstractNode } from './AbstractNode';
import { DeleteResult, Doc, InsertNodeResult, InsertTextResult, MergeResult, Node, SplitResult } from '../interfaces';
import { unreachable } from '../../lib/unrechable';
import { assert } from '../../lib/assert';

export class ContainerNode<Props = void> extends AbstractNode<Props> {
    length(doc: Doc): number {
        return doc.children(this.id).length;
    }

    split(doc: Doc, position: Position): SplitResult {
        if (position.nodeId === this.id) {
            const children = doc.children(this.id);
            assert(position.offset >= 0 && position.offset <= children.length, 'offset is out of range');
            if (position.offset === 0) return { doc, left: null, right: this };
            if (position.offset === children.length) return { doc, left: this, right: null };

            const right = this.copy({}, Node.generateId());
            doc = doc.insertAfter(this.id, right);
            for (const child of children.slice(position.offset)) {
                doc = doc.insertLast(right.id, child);
            }

            return { doc, left: this, right };
        }

        const path = doc.getFullPath(position.nodeId);
        const index = path.indexOf(this.id);
        assert(index >= 0, `split target:${position.nodeId} is not descendant of root:${this.id}`);

        let result: SplitResult = { doc, left: this, right: doc.nextSiblingNodeOrNull(this.id) };

        while (path.length > index) {
            const nodeId = path.pop();
            assert(nodeId !== undefined, 'nodeId is undefined');
            assert(position.nodeId === nodeId, `position:${position.nodeId} is not nodeId:${nodeId}`);

            result = result.doc.get(position.nodeId).split(result.doc, position);
            if (result.right !== null) {
                position = result.doc.startPosition(result.right.id);
            } else if (result.left !== null) {
                position = result.doc.endPosition(result.left.id);
            } else unreachable();
        }

        return result;
    }

    merge(doc: Doc): MergeResult {
        const nextNode = doc.nextSiblingNodeOrNull(this.id);
        if (!(nextNode instanceof this.constructor)) return { doc, position: doc.endPosition(this.id) };

        const prevNodeChildren = doc.children(this.id);
        const nextNodeChildren = doc.children(nextNode.id);
        doc = doc.splice(this.id, prevNodeChildren.length, 0, nextNodeChildren).delete(nextNode.id).doc;
        if (prevNodeChildren.length > 0 && nextNodeChildren.length > 0) {
            return doc.get(prevNodeChildren[prevNodeChildren.length - 1].id).merge(doc);
        }

        return { doc, position: Position.of(this.id, prevNodeChildren.length) };
    }

    insertText(doc: Doc, offset: number, text: string): InsertTextResult {
        const position = Position.of(this.id, offset);

        const nextChild = doc.getByPositionOrNull(position);
        if (nextChild !== null) {
            const result = nextChild.insertText(doc, 0, text);
            if (result.doc !== doc) return result;
        }

        const prevChild = doc.prevPositionNodeOrNull(Position.of(this.id, offset));
        if (prevChild !== null) {
            const result = prevChild.insertText(doc, doc.length(prevChild.id), text);
            if (result.doc !== doc) return result;
        }

        const paragraph = new ParagraphNode();
        const textNode = new TextNode({ text });
        return {
            doc: doc.insertByPosition(position, paragraph).insertFirst(paragraph.id, textNode),
            from: Position.of(textNode.id),
            to: Position.of(textNode.id, text.length),
        };
    }

    insertParagraph(doc: Doc, offset: number): InsertNodeResult {
        const paragraph = new ParagraphNode();
        doc = doc.insert(Position.of(this.id, offset), paragraph);
        return paragraph.insertParagraph(doc, 0);
    }

    /**
     * Delete content backward
     *  1. If there is a child node at the given offset, delegate to the child node.
     *  2. If there is a previous sibling, move this node's contents at the end of the previous sibling
     *  3. Delegate to the parent node.
     */
    deleteContentBackward(doc: Doc, offset: number): DeleteResult {
        if (offset > 0) {
            const child = doc.children(this.id)[offset - 1];
            return child.deleteContentBackward(doc, doc.length(child.id));
        }

        const prevSibling = doc.prevSiblingNodeOrNull(this.id);
        if (prevSibling !== null) {
            const mergeResult = prevSibling.merge(doc);
            return { doc: mergeResult.doc, from: mergeResult.position, to: mergeResult.position };
        }

        const parent = doc.parent(this.id);
        return parent.deleteContentBackward(doc, doc.offset(this.id));
    }

    /**
     * Delete content forward
     *  1. If there is a child node at the given offset, delegate to the child node.
     *  2. If there is a next sibling, move this node's contents at the head of the next sibling
     *  3. Delegate to the parent node.
     **/
    deleteContentForward(doc: Doc, offset: number): DeleteResult {
        if (offset < doc.length(this.id)) {
            const child = doc.children(this.id)[offset];
            return child.deleteContentForward(doc, 0);
        }

        const nextSibling = doc.nextSiblingNodeOrNull(this.id);
        if (nextSibling !== null) {
            const mergeResult = this.merge(doc);
            return { doc: mergeResult.doc, from: mergeResult.position, to: mergeResult.position };
        }

        const parent = doc.parent(this.id);
        return parent.deleteContentForward(doc, doc.offset(this.id) + 1);
    }

    deleteByOffsetRange(doc: Doc, from: number, to: number): DeleteResult {
        const position = Position.of(this.id, from);

        return { doc: doc.splice(this.id, from, to - from, []), from: position, to: position };
    }
}

// There is a circular dependency between ContainerNode and ParagraphNode. Must be placed in the same file.
export class ParagraphNode extends ContainerNode {
    insertText(doc: Doc, offset: number, text: string): InsertTextResult {
        const position = Position.of(this.id, offset);

        const nextChild = doc.getByPositionOrNull(position);
        if (nextChild !== null) {
            const result = nextChild.insertText(doc, 0, text);
            if (result.doc !== doc) return result;
        }

        const prevChild = doc.prevPositionNodeOrNull(Position.of(this.id, offset));
        if (prevChild !== null) {
            const result = prevChild.insertText(doc, 0, text);
            if (result.doc !== doc) return result;
        }

        const textNode = new TextNode({ text });
        return {
            doc: doc.insertByPosition(position, textNode),
            from: Position.of(textNode.id),
            to: Position.of(textNode.id, text.length),
        };
    }

    insertParagraph(doc: Doc, offset: number): InsertNodeResult {
        const paragraph = new ParagraphNode();
        doc = doc.insertAfter(this.id, paragraph);

        for (const child of doc.children(this.id).slice(offset)) {
            doc = doc.insertLast(paragraph.id, doc.get(child.id));
        }

        return { doc, nodeId: paragraph.id };
    }
}

const logger = Logger.of(ContainerNode);
