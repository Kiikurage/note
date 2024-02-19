import { assert } from '../../lib/assert';
import { counter } from '../../lib/counter';
import { createPoint, Point } from '../Point';

const nextNodeId = counter();

export function resetNodeIdCounter() {
    nextNodeId.reset();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeConstructor = new (...args: any[]) => DocNode;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeTypeOf<T extends NodeConstructor> = T extends new (...args: any[]) => infer R ? R : never;

export interface DocNodeDelegate {
    /**
     * Clone this node. Must NOT clone child nodes
     */
    clone(): DocNode;

    /**
     * Insert text at the given offset and returns the range of the inserted contents. This
     * range may include additional nodes that were created to accommodate the inserted text.
     * deleteSelectedRange(returnedRange) must restore the original state.
     */
    insertText(offset: number, text: string): { from: Point; to: Point };

    /**
     * Insert a new paragraph at the given offset and returns the range of the inserted contents.
     * This range may include additional nodes that were created to accommodate the inserted
     * paragraph. {@link deleteByRange}(returnedRange) must restore the original state.
     */
    insertParagraph(offset: number): { from: Point; to: Point };

    /**
     * Delete the content in the given range and returns the deleted contents and deletion point.
     * This may causes additional deletion. e.g. deleting all contents in a node may cause deleting
     * that container node too. {@link insertNodesAtPoint}(returnedPoint, returnedContents) must restore the original state.
     */
    deleteContent(start: number, end: number): { point: Point; contents: DocNode[] };

    /**
     * Delete one unit of content backwardly. Container nodes may delegate this operation to child
     * node. {@link insertNodesAtPoint}(returnedPoint, returnedContents) must restore the original state.
     */
    deleteContentBackward(offset: number): { point: Point; contents: DocNode[] };

    /**
     * Delete one unit of content forwardly. Container nodes may delegate this operation to child
     * node. {@link insertNodesAtPoint}(returnedPoint, returnedContents) must restore the original state.
     */
    deleteContentForward(offset: number): { point: Point; contents: DocNode[] };

    /**
     * Delete end boundary of this node, typically triggers merging with the next node.
     * {@link insertNodesAtPoint}(returnedPoint, returnedContents) must restore the original state.
     */
    deleteEnd(): { point: Point; contents: DocNode[] };

    /**
     * Delete begin boundary of this node, typically triggers merging with the next node.
     * {@link insertNodesAtPoint}(returnedPoint, returnedContents) must restore the original state.
     */
    deleteBegin(): { point: Point; contents: DocNode[] };

    /**
     * Merge this node with {@link DocNode.next} node. i.e. {@link deleteByRange}(lastOfThisNode, firstOfNextNode).
     * {@link insertNodesAtPoint}(returnedPoint, returnedContents) must restore the original state.
     */
    mergeWithNext(): { point: Point; contents: DocNode[] };

    /**
     * Get the layout level of this node.
     * - "block": This node is a block-level node. i.e. it can contain other block-level nodes and inline nodes.
     * - "inline": This node is an inline-level node. i.e. it can only contain other inline-level nodes.
     */
    getLayoutLevel(): 'block' | 'inline';

    /**
     * Get the container type of this node.
     *  - "void": This node cannot contain any child nodes
     *  - "mayBeEmpty": This node can contain child nodes, but it's not required
     *  - "mustNotBeEmpty": This node must contain at least one child node
     */
    getContainerType(): 'void' | 'mayBeEmpty' | 'mustNotBeEmpty';

    /**
     * Return JSON-serializable object for debugging
     */
    dump(): unknown;
}

export abstract class DocNode implements DocNodeDelegate {
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

    isInline(): boolean {
        return this.getLayoutLevel() === 'inline';
    }

    isBlock(): boolean {
        return this.getLayoutLevel() === 'block';
    }

    mayBeEmpty(): boolean {
        return this.getContainerType() === 'mayBeEmpty';
    }

    mustNotBeEmpty(): boolean {
        return this.getContainerType() === 'mustNotBeEmpty';
    }

    void(): boolean {
        return this.getContainerType() === 'void';
    }

    isContainer(): boolean {
        return this.getContainerType() !== 'void';
    }

    /**
     * Split the node at the given offset and returns the split point
     */
    splitNode(offset: number): Point {
        assert(offset >= 0 && offset <= this.length, `Offset ${offset} is out of range: [0, ${this.length}]`);

        const parent = this.parent;
        assert(parent !== null, 'Node must have a parent');
        const offsetWithinParent = this.offsetWithinParent();

        if (offset === 0) return createPoint(parent, offsetWithinParent);
        if (offset === this.length) return createPoint(parent, offsetWithinParent + 1);

        const clone = this.cloneTree();
        this.insertAfter(clone);

        this.deleteContent(offset, this.length);
        clone.deleteContent(0, offset);

        return createPoint(parent, offsetWithinParent + 1);
    }

    offsetWithinParent() {
        assert(this.parent !== null, 'Node must have a parent');
        return this.parent.children.indexOf(this);
    }

    /**
     * Clone this node and all descendants
     */
    cloneTree(cache?: Map<DocNode, DocNode>): DocNode {
        let clone = cache?.get(this);
        if (clone === undefined) {
            clone = this.clone();
            cache?.set(this, clone);
            for (const child of this.children) {
                clone.insertLast(child.cloneTree(cache));
            }
        }
        return clone;
    }

    abstract clone(): DocNode;

    abstract insertText(offset: number, text: string): { from: Point; to: Point };

    abstract insertParagraph(offset: number): { from: Point; to: Point };

    abstract deleteContent(start: number, end: number): { point: Point; contents: DocNode[] };

    abstract deleteContentBackward(offset: number): { point: Point; contents: DocNode[] };

    abstract deleteContentForward(offset: number): { point: Point; contents: DocNode[] };

    abstract deleteEnd(): { point: Point; contents: DocNode[] };

    abstract deleteBegin(): { point: Point; contents: DocNode[] };

    abstract mergeWithNext(): { point: Point; contents: DocNode[] };

    abstract getLayoutLevel(): 'block' | 'inline';

    abstract getContainerType(): 'void' | 'mayBeEmpty' | 'mustNotBeEmpty';

    dump(): unknown {
        return {
            id: this.id,
            type: this.constructor.name,
            children: this.children.map((child) => child.dump()),
        };
    }
}
