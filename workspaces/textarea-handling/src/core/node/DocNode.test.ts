import { assert } from '../../lib/assert';
import { ContainerNode } from './ContainerNode';

const notImplemented = (...args: never[]): never => {
    assert(false, 'not implemented');
};

class DocNodeImpl extends ContainerNode {
    readonly insertText = notImplemented;
    readonly insertParagraph = notImplemented;
    readonly deleteContent = notImplemented;
    readonly deleteContentBackward = notImplemented;
    readonly deleteContentForward = notImplemented;
    readonly deleteEnd = notImplemented;
    readonly deleteBegin = notImplemented;
    readonly mergeWithNext = notImplemented;
}

describe('DocNode', () => {
    it('constructor', () => {
        const node = new DocNodeImpl();
        expect(node.parent).toBe(null);
        expect(node.children).toEqual([]);
        expect(node.next).toBe(null);
        expect(node.prev).toBe(null);
    });

    describe('insertChild', () => {
        it('insert a new child', () => {
            const parent = new DocNodeImpl();
            const child = new DocNodeImpl();

            parent.insertChild(0, child);

            expect(parent.parent).toBe(null);
            expect(parent.children).toEqual([child]);
            expect(parent.next).toBe(null);
            expect(parent.prev).toBe(null);

            expect(child.parent).toBe(parent);
            expect(child.children).toEqual([]);
            expect(child.next).toBe(null);
            expect(child.prev).toBe(null);
        });

        it('insert 2 children', () => {
            const parent = new DocNodeImpl();
            const child1 = new DocNodeImpl();
            const child2 = new DocNodeImpl();

            parent.insertChild(0, child1);
            parent.insertChild(1, child2);

            expect(parent.parent).toBe(null);
            expect(parent.children).toEqual([child1, child2]);
            expect(parent.next).toBe(null);
            expect(parent.prev).toBe(null);

            expect(child1.parent).toBe(parent);
            expect(child1.children).toEqual([]);
            expect(child1.next).toBe(child2);
            expect(child1.prev).toBe(null);

            expect(child2.parent).toBe(parent);
            expect(child2.children).toEqual([]);
            expect(child2.next).toBe(null);
            expect(child2.prev).toBe(child1);
        });

        it('insert 3 children', () => {
            const parent = new DocNodeImpl();
            const child1 = new DocNodeImpl();
            const child2 = new DocNodeImpl();
            const child3 = new DocNodeImpl();

            parent.insertChild(0, child1);
            parent.insertChild(1, child2);
            parent.insertChild(2, child3);

            expect(parent.parent).toBe(null);
            expect(parent.children).toEqual([child1, child2, child3]);
            expect(parent.next).toBe(null);
            expect(parent.prev).toBe(null);

            expect(child1.parent).toBe(parent);
            expect(child1.children).toEqual([]);
            expect(child1.next).toBe(child2);
            expect(child1.prev).toBe(null);

            expect(child2.parent).toBe(parent);
            expect(child2.children).toEqual([]);
            expect(child2.next).toBe(child3);
            expect(child2.prev).toBe(child1);

            expect(child3.parent).toBe(parent);
            expect(child3.children).toEqual([]);
            expect(child3.next).toBe(null);
            expect(child3.prev).toBe(child2);
        });

        it('insert a child between other children', () => {
            const parent = new DocNodeImpl();
            const child1 = new DocNodeImpl();
            const child2 = new DocNodeImpl();
            const child3 = new DocNodeImpl();

            parent.insertChild(0, child1);
            parent.insertChild(1, child2);
            parent.insertChild(1, child3);

            expect(parent.parent).toBe(null);
            expect(parent.children).toEqual([child1, child3, child2]);
            expect(parent.next).toBe(null);
            expect(parent.prev).toBe(null);

            expect(child1.parent).toBe(parent);
            expect(child1.children).toEqual([]);
            expect(child1.next).toBe(child3);
            expect(child1.prev).toBe(null);

            expect(child2.parent).toBe(parent);
            expect(child2.children).toEqual([]);
            expect(child2.next).toBe(null);
            expect(child2.prev).toBe(child3);

            expect(child3.parent).toBe(parent);
            expect(child3.children).toEqual([]);
            expect(child3.next).toBe(child2);
            expect(child3.prev).toBe(child1);
        });

        it('invalid insert point', () => {
            const parent = new DocNodeImpl();
            const child = new DocNodeImpl();

            expect(() => parent.insertChild(4, child)).toThrow();
        });

        it('insert a sub tree', () => {
            const node1 = new DocNodeImpl();
            const node2 = new DocNodeImpl();
            const node3 = new DocNodeImpl();
            const node4 = new DocNodeImpl();
            const node5 = new DocNodeImpl();

            node1.insertLast(node2);
            node2.insertLast(node3);
            node3.insertLast(node4);
            node4.insertLast(node5);

            node1.insertChild(1, node3);

            expect(node1.children).toEqual([node2, node3]);

            expect(node2.parent).toBe(node1);
            expect(node2.children).toEqual([]);
            expect(node2.next).toBe(node3);
            expect(node2.prev).toBe(null);

            expect(node3.parent).toBe(node1);
            expect(node3.children).toEqual([node4]);
            expect(node3.next).toBe(null);
            expect(node3.prev).toBe(node2);
        });
    });

    describe('insertFirst', () => {
        it('insert a new child at first', () => {
            const parent = new DocNodeImpl();
            const child1 = new DocNodeImpl();
            const child2 = new DocNodeImpl();

            parent.insertChild(0, child1);
            parent.insertFirst(child2);

            expect(parent.children).toEqual([child2, child1]);
        });
    });

    describe('insertLast', () => {
        it('insert a new child at last', () => {
            const parent = new DocNodeImpl();
            const child1 = new DocNodeImpl();
            const child2 = new DocNodeImpl();

            parent.insertChild(0, child1);
            parent.insertLast(child2);

            expect(parent.children).toEqual([child1, child2]);
        });
    });

    describe('insertBefore', () => {
        it('insert a new sibling', () => {
            const parent = new DocNodeImpl();
            const child1 = new DocNodeImpl();
            const child2 = new DocNodeImpl();

            parent.insertLast(child1);
            child1.insertBefore(child2);

            expect(parent.children).toEqual([child2, child1]);
        });

        it('if the node is floated, insertBefore should be failed', () => {
            const child1 = new DocNodeImpl();
            const child2 = new DocNodeImpl();

            expect(() => child1.insertBefore(child2)).toThrow();
        });
    });

    describe('insertAfter', () => {
        it('insert a new sibling', () => {
            const parent = new DocNodeImpl();
            const child1 = new DocNodeImpl();
            const child2 = new DocNodeImpl();

            parent.insertLast(child1);
            child1.insertAfter(child2);

            expect(parent.children).toEqual([child1, child2]);
        });

        it('if the node is floated, insertAfter should be failed', () => {
            const child1 = new DocNodeImpl();
            const child2 = new DocNodeImpl();

            expect(() => child1.insertAfter(child2)).toThrow();
        });
    });

    describe('remove', () => {
        it('remove a child', () => {
            const parent = new DocNodeImpl();
            const child1 = new DocNodeImpl();
            const child2 = new DocNodeImpl();
            const child3 = new DocNodeImpl();

            parent.insertLast(child1);
            parent.insertLast(child2);
            parent.insertLast(child3);

            child2.remove();

            expect(parent.parent).toBe(null);
            expect(parent.children).toEqual([child1, child3]);
            expect(parent.next).toBe(null);
            expect(parent.prev).toBe(null);

            expect(child1.parent).toBe(parent);
            expect(child1.children).toEqual([]);
            expect(child1.next).toBe(child3);
            expect(child1.prev).toBe(null);

            expect(child3.parent).toBe(parent);
            expect(child3.children).toEqual([]);
            expect(child3.next).toBe(null);
            expect(child3.prev).toBe(child1);

            expect(child2.parent).toBe(null);
            expect(child2.children).toEqual([]);
            expect(child2.next).toBe(null);
            expect(child2.prev).toBe(null);
        });

        it('remove a floated node cause nothing', () => {
            const child = new DocNodeImpl();
            child.remove();
            expect(child.parent).toBe(null);
        });
    });
});
