import { Doc } from './Doc';
import { Node } from './Node';
import { Position } from './Position';

class SimpleNode extends Node {
    static create() {
        return new SimpleNode({});
    }
}

const NON_EXISTENT_NODE_ID = 999;

describe('Doc', () => {
    describe('get', () => {
        it('get root node', () => {
            const doc = Doc.empty();
            expect(doc.get(doc.root.id)).toBe(doc.root);
        });

        it('get non-existent node', () => {
            expect(() => Doc.empty().get(NON_EXISTENT_NODE_ID)).toThrow();
        });

        it('get node', () => {
            let doc = Doc.empty();
            const node = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.get(node.id)).toEqual(node);
        });
    });

    describe('getOrNull', () => {
        it('get root node', () => {
            const doc = Doc.empty();
            expect(doc.getOrNull(doc.root.id)).toBe(doc.root);
        });

        it('get non-existent node', () => {
            expect(Doc.empty().getOrNull(NON_EXISTENT_NODE_ID)).toBeNull();
        });

        it('get node', () => {
            let doc = Doc.empty();
            const node = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.getOrNull(node.id)).toEqual(node);
        });
    });

    describe('getByPositionOrNull', () => {
        it('get next of root node', () => {
            const doc = Doc.empty();
            expect(doc.getByPositionOrNull(Position.of(doc.root.id))).toBeNull();
        });

        it('get next of non-existent node', () => {
            const doc = Doc.empty();
            expect(doc.getByPositionOrNull(Position.of(NON_EXISTENT_NODE_ID))).toBeNull();
        });

        it('get next of node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.getByPositionOrNull(Position.of(doc.root.id, 0))).toBe(node1);
            expect(doc.getByPositionOrNull(Position.of(doc.root.id, 1))).toBe(node2);
            expect(doc.getByPositionOrNull(Position.of(doc.root.id, 2))).toBeNull();
        });
    });

    describe('parentOrNull', () => {
        it('get parent of root node', () => {
            const doc = Doc.empty();
            expect(doc.parentOrNull(doc.root.id)).toBeNull();
        });

        it('get parent of non-existent node', () => {
            const doc = Doc.empty();
            expect(doc.parentOrNull(NON_EXISTENT_NODE_ID)).toBeNull();
        });

        it('get parent of node', () => {
            let doc = Doc.empty();
            const node = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.parentOrNull(node.id)).toBe(doc.root);
        });
    });

    describe('parentIdOrNull', () => {
        it('get parent of root node', () => {
            const doc = Doc.empty();
            expect(doc.parentIdOrNull(doc.root.id)).toBeNull();
        });

        it('get parent of non-existent node', () => {
            const doc = Doc.empty();
            expect(doc.parentIdOrNull(999)).toBeNull();
        });

        it('get parent of node', () => {
            let doc = Doc.empty();
            const node = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.parentIdOrNull(node.id)).toBe(doc.root.id);
        });
    });

    describe('children', () => {
        it('get children of root node', () => {
            const doc = Doc.empty();
            expect(doc.children(doc.root.id)).toEqual([]);
        });

        it('get children of non-existent node', () => {
            const doc = Doc.empty();
            expect(doc.children(NON_EXISTENT_NODE_ID)).toEqual([]);
        });

        it('get children of node', () => {
            let doc = Doc.empty();
            const node = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.children(doc.root.id)).toEqual([node]);
        });
    });

    describe('childIds', () => {
        it('get children of root node', () => {
            const doc = Doc.empty();
            expect(doc.childIds(doc.root.id)).toEqual([]);
        });

        it('get children of non-existent node', () => {
            const doc = Doc.empty();
            expect(doc.childIds(NON_EXISTENT_NODE_ID)).toEqual([]);
        });

        it('get children of node', () => {
            let doc = Doc.empty();
            const node = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.childIds(doc.root.id)).toEqual([node.id]);
        });
    });

    describe('nextSiblingNodeOrNull', () => {
        it('get next of root node', () => {
            const doc = Doc.empty();
            expect(doc.nextSiblingNodeOrNull(doc.root.id)).toBeNull();
        });

        it('get next of non-existent node', () => {
            const doc = Doc.empty();
            expect(doc.nextSiblingNodeOrNull(NON_EXISTENT_NODE_ID)).toBeNull();
        });

        it('get next of node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.nextSiblingNodeOrNull(node1.id)).toBe(node2);
            expect(doc.nextSiblingNodeOrNull(node2.id)).toBeNull();
        });
    });

    describe('nextPositionNodeOrNull', () => {
        it('get next of root node', () => {
            const doc = Doc.empty();
            expect(doc.nextPositionNodeOrNull(Position.of(doc.root.id))).toBeNull();
        });

        it('get next of non-existent node', () => {
            const doc = Doc.empty();
            expect(doc.nextPositionNodeOrNull(Position.of(NON_EXISTENT_NODE_ID))).toBeNull();
        });

        it('get next of node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.nextPositionNodeOrNull(Position.of(doc.root.id, 0))).toBe(node2);
            expect(doc.nextPositionNodeOrNull(Position.of(doc.root.id, 1))).toBeNull();
            expect(doc.nextPositionNodeOrNull(Position.of(doc.root.id, 2))).toBeNull();
        });
    });

    describe('prevSiblingNodeOrNull', () => {
        it('get prev of root node', () => {
            const doc = Doc.empty();
            expect(doc.prevSiblingNodeOrNull(doc.root.id)).toBeNull();
        });

        it('get prev of non-existent node', () => {
            const doc = Doc.empty();
            expect(doc.prevSiblingNodeOrNull(NON_EXISTENT_NODE_ID)).toBeNull();
        });

        it('get prev of node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.prevSiblingNodeOrNull(node1.id)).toBeNull();
            expect(doc.prevSiblingNodeOrNull(node2.id)).toBe(node1);
        });
    });

    describe('prevPositionNodeOrNull', () => {
        it('get next of root node', () => {
            const doc = Doc.empty();
            expect(doc.prevPositionNodeOrNull(Position.of(doc.root.id))).toBeNull();
        });

        it('get next of non-existent node', () => {
            const doc = Doc.empty();
            expect(doc.prevPositionNodeOrNull(Position.of(NON_EXISTENT_NODE_ID))).toBeNull();
        });

        it('get next of node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.prevPositionNodeOrNull(Position.of(doc.root.id, 0))).toBeNull();
            expect(doc.prevPositionNodeOrNull(Position.of(doc.root.id, 1))).toBe(node1);
            expect(doc.prevPositionNodeOrNull(Position.of(doc.root.id, 2))).toBe(node2);
        });
    });

    describe('findAncestor', () => {
        it('find ancestor of root node', () => {
            const doc = Doc.empty();
            expect(doc.findAncestor(doc.root.id, (node) => node instanceof Node)).toBe(doc.root.id);
        });

        it('find ancestor of non-existent node throws', () => {
            const doc = Doc.empty();
            expect(() => doc.findAncestor(NON_EXISTENT_NODE_ID, (node) => node instanceof Node)).toThrow();
        });

        it('find ancestor of node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(node1.id, node2);

            expect(doc.findAncestor(node2.id, (node) => node.id === node1.id)).toBe(node1.id);
        });
    });

    describe('insert', () => {
        it('insert into root node', () => {
            const doc = Doc.empty();
            const node = SimpleNode.create();
            const newDoc = doc.insertLast(doc.root.id, node);

            expect(newDoc.get(node.id)).toBe(node);
            expect(newDoc.childIds(doc.root.id)).toEqual([node.id]);
        });

        it('insert into non-existent node', () => {
            const node = SimpleNode.create();

            expect(() => Doc.empty().insert(Position.of(NON_EXISTENT_NODE_ID, 0), node)).toThrow();
        });

        it('insert into node', () => {
            let doc = Doc.empty();
            const node = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.get(node.id)).toBe(node);
            expect(doc.childIds(doc.root.id)).toEqual([node.id]);
            expect(doc.childIds(node.id)).toEqual([]);
            expect(doc.parentId(node.id)).toBe(doc.root.id);
        });

        it('insert existing node will move nodes', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node11 = SimpleNode.create();
            const node12 = SimpleNode.create();
            const node13 = SimpleNode.create();
            const node2 = SimpleNode.create();
            const node21 = SimpleNode.create();
            const node22 = SimpleNode.create();
            const node221 = SimpleNode.create();
            const node222 = SimpleNode.create();
            const node223 = SimpleNode.create();
            const node23 = SimpleNode.create();
            const node3 = SimpleNode.create();
            const node31 = SimpleNode.create();
            const node32 = SimpleNode.create();
            const node33 = SimpleNode.create();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(node1.id, node11);
            doc = doc.insertLast(node1.id, node12);
            doc = doc.insertLast(node1.id, node13);
            doc = doc.insertLast(doc.root.id, node2);
            doc = doc.insertLast(node2.id, node21);
            doc = doc.insertLast(node2.id, node22);
            doc = doc.insertLast(node22.id, node221);
            doc = doc.insertLast(node22.id, node222);
            doc = doc.insertLast(node22.id, node223);
            doc = doc.insertLast(node2.id, node23);
            doc = doc.insertLast(doc.root.id, node3);
            doc = doc.insertLast(node3.id, node31);
            doc = doc.insertLast(node3.id, node32);
            doc = doc.insertLast(node3.id, node33);

            const newDoc = doc.insert(Position.of(doc.root.id, 2), node22);

            expect(newDoc.childIds(doc.root.id)).toEqual([node1.id, node2.id, node22.id, node3.id]);
            expect(newDoc.childIds(node2.id)).toEqual([node21.id, node23.id]);
            expect(newDoc.childIds(node22.id)).toEqual([node221.id, node222.id, node223.id]);
            expect(newDoc.get(node2.id)).toBe(node2);
            expect(newDoc.get(node22.id)).toBe(node22);
            expect(newDoc.get(node221.id)).toBe(node221);
            expect(newDoc.get(node222.id)).toBe(node222);
            expect(newDoc.get(node223.id)).toBe(node223);
        });
    });

    describe('insertAfterOrNull', () => {
        it('insert after root node', () => {
            const doc = Doc.empty();
            const node = SimpleNode.create();

            expect(() => doc.insertAfter(doc.root.id, node)).toThrow();
        });

        it('insert after non-existent node', () => {
            const doc = Doc.empty();
            const node = SimpleNode.create();

            expect(() => doc.insertAfter(NON_EXISTENT_NODE_ID, node)).toThrow();
        });

        it('insert after node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insertAfter(node1.id, node2);

            expect(doc.get(node2.id)).toBe(node2);
            expect(doc.childIds(doc.root.id)).toEqual([node1.id, node2.id]);
        });
    });

    describe('insertBeforeOrNull', () => {
        it('insert before root node', () => {
            const doc = Doc.empty();
            const node = SimpleNode.create();

            expect(() => doc.insertBefore(doc.root.id, node)).toThrow();
        });

        it('insert before non-existent node', () => {
            const doc = Doc.empty();
            const node = SimpleNode.create();

            expect(() => doc.insertBefore(NON_EXISTENT_NODE_ID, node)).toThrow();
        });

        it('insert before node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insertBefore(node1.id, node2);

            expect(doc.get(node2.id)).toBe(node2);
            expect(doc.childIds(doc.root.id)).toEqual([node2.id, node1.id]);
        });
    });

    describe('insertFirstOrNull', () => {
        it('insert first into root node', () => {
            const doc = Doc.empty();
            const node = SimpleNode.create();
            const newDoc = doc.insertFirst(doc.root.id, node);

            expect(doc.getOrNull(node.id)).toBeNull();
            expect(doc.childIds(doc.root.id)).toEqual([]);

            expect(newDoc.get(node.id)).toBe(node);
            expect(newDoc.childIds(doc.root.id)).toEqual([node.id]);
        });

        it('insert first into non-existent node throws', () => {
            expect(() => Doc.empty().insertFirst(999, SimpleNode.create())).toThrow();
        });

        it('insert first into node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insertFirst(doc.root.id, node2);

            expect(doc.get(node2.id)).toBe(node2);
            expect(doc.childIds(doc.root.id)).toEqual([node2.id, node1.id]);
        });
    });

    describe('insertLastOrNull', () => {
        it('insert last into root node', () => {
            const doc = Doc.empty();
            const node = SimpleNode.create();
            const newDoc = doc.insertLast(doc.root.id, node);

            expect(doc.getOrNull(node.id)).toBeNull();
            expect(doc.childIds(doc.root.id)).toEqual([]);

            expect(newDoc.get(node.id)).toBe(node);
            expect(newDoc.childIds(doc.root.id)).toEqual([node.id]);
        });

        it('insert last into non-existent node', () => {
            expect(() => Doc.empty().insertLast(999, SimpleNode.create())).toThrow();
        });

        it('insert last into node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.get(node2.id)).toBe(node2);
            expect(doc.childIds(doc.root.id)).toEqual([node1.id, node2.id]);
        });
    });

    describe('delete', () => {
        it('delete root node', () => {
            const doc = Doc.empty();
            const newDoc = doc.delete(doc.root.id);

            expect(newDoc.getOrNull(doc.root.id)).toBeNull();
            expect(newDoc.childIds(doc.root.id)).toEqual([]);
        });

        it('delete non-existent node', () => {
            const doc = Doc.empty();
            const newDoc = doc.delete(NON_EXISTENT_NODE_ID);

            expect(newDoc.getOrNull(NON_EXISTENT_NODE_ID)).toBeNull();
            expect(newDoc.childIds(doc.root.id)).toEqual([]);
        });

        it('delete node', () => {
            let doc = Doc.empty();
            const node = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node);
            const newDoc = doc.delete(node.id);

            expect(doc.get(node.id)).toBe(node);
            expect(newDoc.getOrNull(node.id)).toBeNull();
        });

        it('deleting a node will delete child nodes as well', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insert(Position.of(doc.root.id, 1), node2);
            const newDoc = doc.delete(doc.root.id);

            expect(doc.get(node1.id)).toBe(node1);
            expect(doc.get(node2.id)).toBe(node2);
            expect(newDoc.getOrNull(node1.id)).toBeNull();
            expect(newDoc.getOrNull(node2.id)).toBeNull();
        });
    });

    describe('splice', () => {
        it('splice root node', () => {
            const doc = Doc.empty();
            const node = SimpleNode.create();
            const newDoc = doc.splice(doc.root.id, 0, 0, [node]);

            expect(newDoc.get(node.id)).toBe(node);
            expect(newDoc.childIds(doc.root.id)).toEqual([node.id]);
        });

        it('splice non-existent node', () => {
            expect(() => Doc.empty().splice(999, 0, 0, [SimpleNode.create()])).toThrow();
        });

        it('splice node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            const newDoc = doc.splice(doc.root.id, 1, 0, [node2]);

            expect(newDoc.get(node2.id)).toBe(node2);
            expect(newDoc.childIds(doc.root.id)).toEqual([node1.id, node2.id]);
        });

        it('insert existing node will move nodes', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node11 = SimpleNode.create();
            const node12 = SimpleNode.create();
            const node13 = SimpleNode.create();
            const node2 = SimpleNode.create();
            const node21 = SimpleNode.create();
            const node22 = SimpleNode.create();
            const node221 = SimpleNode.create();
            const node222 = SimpleNode.create();
            const node223 = SimpleNode.create();
            const node23 = SimpleNode.create();
            const node3 = SimpleNode.create();
            const node31 = SimpleNode.create();
            const node32 = SimpleNode.create();
            const node33 = SimpleNode.create();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(node1.id, node11);
            doc = doc.insertLast(node1.id, node12);
            doc = doc.insertLast(node1.id, node13);
            doc = doc.insertLast(doc.root.id, node2);
            doc = doc.insertLast(node2.id, node21);
            doc = doc.insertLast(node2.id, node22);
            doc = doc.insertLast(node22.id, node221);
            doc = doc.insertLast(node22.id, node222);
            doc = doc.insertLast(node22.id, node223);
            doc = doc.insertLast(node2.id, node23);
            doc = doc.insertLast(doc.root.id, node3);
            doc = doc.insertLast(node3.id, node31);
            doc = doc.insertLast(node3.id, node32);
            doc = doc.insertLast(node3.id, node33);

            const newDoc = doc.splice(doc.root.id, 1, 1, [node22]);

            expect(newDoc.getOrNull(node2.id)).toBeNull();
            expect(newDoc.childIds(doc.root.id)).toEqual([node1.id, node22.id, node3.id]);
            expect(newDoc.childIds(node22.id)).toEqual([node221.id, node222.id, node223.id]);
            expect(newDoc.get(node22.id)).toBe(node22);
            expect(newDoc.get(node221.id)).toBe(node221);
            expect(newDoc.get(node222.id)).toBe(node222);
            expect(newDoc.get(node223.id)).toBe(node223);
        });
    });

    describe('update', () => {
        it('update root node throws', () => {
            const doc = Doc.empty();
            expect(() => doc.update(doc.root.id, (node) => SimpleNode.create())).toThrow();
        });

        it('update non-existent node', () => {
            const doc = Doc.empty();
            expect(() => doc.update(NON_EXISTENT_NODE_ID, (node) => SimpleNode.create())).toThrow();
        });

        it('update node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            const newDoc = doc.update(node1.id, () => node2);

            expect(doc.get(node1.id)).toEqual(node1);
            expect(doc.getOrNull(node2.id)).toBeNull();
            expect(doc.childIds(doc.root.id)).toEqual([node1.id]);

            expect(newDoc.getOrNull(node1.id)).toBeNull();
            expect(newDoc.get(node2.id)).toEqual(node2);
            expect(newDoc.childIds(doc.root.id)).toEqual([node2.id]);
        });
    });

    describe('getFullPath', () => {
        it('get full path of root node', () => {
            const doc = Doc.empty();
            expect(doc.getFullPath(doc.root.id)).toEqual([doc.root.id]);
        });

        it('get full path of non-existent node', () => {
            const doc = Doc.empty();
            expect(() => doc.getFullPath(NON_EXISTENT_NODE_ID)).toThrow();
        });

        it('get full path of node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            const node3 = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insert(Position.of(doc.root.id, 1), node2);
            doc = doc.insert(Position.of(node1.id, 0), node3);

            expect(doc.getFullPath(node1.id)).toEqual([doc.root.id, node1.id]);
            expect(doc.getFullPath(node2.id)).toEqual([doc.root.id, node2.id]);
            expect(doc.getFullPath(node3.id)).toEqual([doc.root.id, node1.id, node3.id]);
        });
    });

    describe('compare', () => {
        it('compare root node', () => {
            const doc = Doc.empty();
            expect(doc.compare(doc.root.id, doc.root.id)).toBe(0);
        });

        it('compare non-existent node', () => {
            const doc = Doc.empty();
            expect(() => doc.compare(NON_EXISTENT_NODE_ID, NON_EXISTENT_NODE_ID)).toThrow();
        });

        it('compare node', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            const node3 = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insert(Position.of(doc.root.id, 1), node2);
            doc = doc.insert(Position.of(node1.id, 0), node3);

            expect(doc.compare(node1.id, node1.id)).toBe(0);
            expect(doc.compare(node1.id, node2.id)).toBe(-1);
            expect(doc.compare(node1.id, node3.id)).toBe(-1);
            expect(doc.compare(node2.id, node1.id)).toBe(1);
            expect(doc.compare(node2.id, node2.id)).toBe(0);
            expect(doc.compare(node2.id, node3.id)).toBe(1);
            expect(doc.compare(node3.id, node1.id)).toBe(1);
            expect(doc.compare(node3.id, node2.id)).toBe(-1);
            expect(doc.compare(node3.id, node3.id)).toBe(0);
        });

        it('a path includes the other', () => {
            let doc = Doc.empty();
            const node1 = SimpleNode.create();
            const node2 = SimpleNode.create();
            const node3 = SimpleNode.create();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insert(Position.of(node1.id, 0), node2);
            doc = doc.insert(Position.of(node1.id, 1), node3);

            expect(doc.compare(Position.of(node1.id, 0), node2.id)).toBe(-1);
            expect(doc.compare(Position.of(node1.id, 1), node3.id)).toBe(-1);
            expect(doc.compare(Position.of(node1.id, 2), node3.id)).toBe(1);
        });
    });
});
