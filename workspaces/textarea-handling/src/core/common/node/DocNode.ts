import { assert } from '../../../lib/assert';
import { counter } from '../../../lib/counter';
import { Point } from '../Point';

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

    abstract insertText(offset: number, text: string): InsertContentResult;

    abstract insertParagraph(offset: number): InsertContentResult;

    abstract deleteContent(start: number, end: number): DeleteContentResult;

    abstract deleteContentBackward(offset: number): DeleteContentResult;

    abstract deleteContentForward(offset: number): DeleteContentResult;

    abstract deleteEnd(): DeleteContentResult;

    abstract deleteBegin(): DeleteContentResult;

    abstract mergeWithNext(): MergeContentResult;
}

export interface InsertContentResult {
    pointAfterInsertion: Point;
}

export interface DeleteContentResult {
    pointAfterDeletion: Point;
}

export interface MergeContentResult {
    mergedPoint: Point;
}
