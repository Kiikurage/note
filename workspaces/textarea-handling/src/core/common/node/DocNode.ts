import { assert } from '../../../lib/assert';
import { counter } from '../../../lib/counter';
import { Position } from '../Position';

const nextNodeId = counter();

export function resetNodeIdCounter() {
    nextNodeId.reset();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeConstructor = new (...args: any[]) => DocNode;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeTypeOf<T extends NodeConstructor> = T extends new (...args: any[]) => infer R ? R : never;

export abstract class DocNode {
    readonly id = nextNodeId();
    private _parent: DocNode | null = null;
    private _next: DocNode | null = null;
    private _prev: DocNode | null = null;
    private _children: DocNode[] = [];

    get parent(): DocNode | null {
        return this._parent;
    }

    get children(): readonly DocNode[] {
        return this._children;
    }

    get next(): DocNode | null {
        return this._next;
    }

    get prev(): DocNode | null {
        return this._prev;
    }

    getSelfAndAncestors(): DocNode[] {
        const ancestors: DocNode[] = [];
        let current: DocNode | null = this;
        while (current !== null) {
            ancestors.push(current);
            current = current.parent;
        }
        return ancestors;
    }

    static getCommonAncestor(node1: DocNode, node2: DocNode): DocNode | null {
        const ancestors1 = new Set(node1.getSelfAndAncestors());
        let current: DocNode | null = node2;
        while (current !== null) {
            if (ancestors1.has(current)) return current;
            current = current.parent;
        }
        return null;
    }

    insertChild(offset: number, child: DocNode): void {
        assert(
            offset >= 0 && offset <= this._children.length,
            `Offset ${offset} is out of range: [0, ${this._children.length}]`,
        );
        if (child.parent !== null) child.remove();

        const prevChild = this._children[offset - 1] ?? null;
        const nextChild = this._children[offset] ?? null;

        this._children.splice(offset, 0, child);
        child._parent = this;

        if (prevChild) prevChild._next = child;
        child._prev = prevChild;

        if (nextChild) nextChild._prev = child;
        child._next = nextChild;
    }

    insertFirst(child: DocNode): void {
        this.insertChild(0, child);
    }

    insertLast(child: DocNode): void {
        this.insertChild(this.children.length, child);
    }

    insertBefore(child: DocNode): void {
        assert(this.parent !== null, 'Cannot insert after a node without a parent');

        const offset = this.parent.children.indexOf(this);
        assert(offset !== -1, 'Parent does not contain this node');

        this.parent.insertChild(offset, child);
    }

    insertAfter(child: DocNode): void {
        assert(this.parent !== null, 'Cannot insert after a node without a parent');

        const offset = this.parent.children.indexOf(this);
        assert(offset !== -1, 'Parent does not contain this node');

        this.parent.insertChild(offset + 1, child);
    }

    remove(): void {
        if (this.parent === null) return;

        const offset = this.parent.children.indexOf(this);
        assert(offset !== -1, 'Parent does not contain this node');

        this.parent._children.splice(offset, 1);
        this._parent = null;

        if (this._prev) this._prev._next = this._next;
        if (this._next) this._next._prev = this._prev;
        this._prev = null;
        this._next = null;
    }

    findAncestor(predicate: (node: DocNode) => boolean): DocNode | null {
        let current: DocNode | null = this;
        while (current !== null) {
            if (predicate(current)) return current;
            current = current.parent;
        }
        return null;
    }

    get length(): number {
        return this.children.length;
    }

    /**
     * Insert text into the node
     * @param offset
     * @param text
     */
    abstract insertText(offset: number, text: string): InsertContentResult;

    /**
     * Insert paragraph break.
     * @param offset
     */
    abstract insertParagraph(offset: number): InsertContentResult;

    /**
     * Delete content in this node
     * @param start
     * @param end
     */
    abstract deleteContent(start: number, end: number): DeleteContentResult;

    /**
     * Delete one character backwardly
     * @param offset
     */
    abstract deleteContentBackward(offset: number): DeleteContentResult;

    /**
     * Delete one character forwardly
     * @param offset
     */
    abstract deleteContentForward(offset: number): DeleteContentResult;

    /**
     * Delete the end of the node. i.e. deleteContentForward(this.length).
     *
     *  - If this content has boundary, this operation semantically means deleting that boundary.
     *      e.g. For ParagraphNode, this means deleting its paragraph break.
     *  - If this content doesn't have the boundary, this operation semantically equals to
     *      this.next.deleteContentForward(0).
     *  - If this node doesn't have a next sibling, delegate to parent.deleteEnd().
     */
    abstract deleteEnd(): DeleteContentResult;

    /**
     * Delete the begin of the node. Semantics are same as {@link deleteEnd}.
     */
    abstract deleteBegin(): DeleteContentResult;

    /**
     * Merge this node with the next node.
     *  - If there is no next node, do nothing.
     *  - If this node cannot be merged with the next node, do nothing.
     *  - If this node can be merged. merge child nodes recursively.
     */
    abstract mergeWithNext(): MergeContentResult;
}

export interface InsertContentResult {
    positionAfterInsertion: Position;
}

export interface DeleteContentResult {
    positionAfterDeletion: Position;
}

export interface MergeContentResult {
    mergedPosition: Position;
}
