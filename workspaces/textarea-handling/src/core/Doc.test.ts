import { createDoc } from './createDoc';
import { Position } from './Position';
import { ContainerNode, ParagraphNode } from './node/ContainerNode';
import { TextNode } from './node/TextNode';
import { NodeSerializer } from '../serialize/NodeSerializer';
import { RootNode } from './node/RootNode';

const createNode = () => new ContainerNode({});

const NON_EXISTENT_NODE_ID = 999;

describe('Doc', () => {
    describe('get', () => {
        it('get root node', () => {
            const doc = createDoc();
            expect(doc.get(doc.root.id)).toBe(doc.root);
        });

        it('get non-existent node', () => {
            expect(() => createDoc().get(NON_EXISTENT_NODE_ID)).toThrow();
        });

        it('get node', () => {
            let doc = createDoc();
            const node = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.get(node.id)).toEqual(node);
        });
    });

    describe('getOrNull', () => {
        it('get root node', () => {
            const doc = createDoc();
            expect(doc.getOrNull(doc.root.id)).toBe(doc.root);
        });

        it('get non-existent node', () => {
            expect(createDoc().getOrNull(NON_EXISTENT_NODE_ID)).toBeNull();
        });

        it('get node', () => {
            let doc = createDoc();
            const node = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.getOrNull(node.id)).toEqual(node);
        });
    });

    describe('getByPositionOrNull', () => {
        it('get next of root node', () => {
            const doc = createDoc();
            expect(doc.getByPositionOrNull(Position.of(doc.root.id))).toBeNull();
        });

        it('get next of non-existent node', () => {
            const doc = createDoc();
            expect(doc.getByPositionOrNull(Position.of(NON_EXISTENT_NODE_ID))).toBeNull();
        });

        it('get next of node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.getByPositionOrNull(Position.of(doc.root.id, 0))).toBe(node1);
            expect(doc.getByPositionOrNull(Position.of(doc.root.id, 1))).toBe(node2);
            expect(doc.getByPositionOrNull(Position.of(doc.root.id, 2))).toBeNull();
        });
    });

    describe('parentOrNull', () => {
        it('get parent of root node', () => {
            const doc = createDoc();
            expect(doc.parentOrNull(doc.root.id)).toBeNull();
        });

        it('get parent of non-existent node', () => {
            const doc = createDoc();
            expect(doc.parentOrNull(NON_EXISTENT_NODE_ID)).toBeNull();
        });

        it('get parent of node', () => {
            let doc = createDoc();
            const node = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.parentOrNull(node.id)).toBe(doc.root);
        });
    });

    describe('children', () => {
        it('get children of root node', () => {
            const doc = createDoc();
            expect(doc.children(doc.root.id)).toEqual([]);
        });

        it('get children of non-existent node', () => {
            const doc = createDoc();
            expect(doc.children(NON_EXISTENT_NODE_ID)).toEqual([]);
        });

        it('get children of node', () => {
            let doc = createDoc();
            const node = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.children(doc.root.id)).toEqual([node]);
        });
    });

    describe('nextSiblingNodeOrNull', () => {
        it('get next of root node', () => {
            const doc = createDoc();
            expect(doc.nextSiblingNodeOrNull(doc.root.id)).toBeNull();
        });

        it('get next of non-existent node', () => {
            const doc = createDoc();
            expect(doc.nextSiblingNodeOrNull(NON_EXISTENT_NODE_ID)).toBeNull();
        });

        it('get next of node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.nextSiblingNodeOrNull(node1.id)).toBe(node2);
            expect(doc.nextSiblingNodeOrNull(node2.id)).toBeNull();
        });
    });

    describe('nextPositionNodeOrNull', () => {
        it('get next of root node', () => {
            const doc = createDoc();
            expect(doc.nextPositionNodeOrNull(Position.of(doc.root.id))).toBeNull();
        });

        it('get next of non-existent node', () => {
            const doc = createDoc();
            expect(doc.nextPositionNodeOrNull(Position.of(NON_EXISTENT_NODE_ID))).toBeNull();
        });

        it('get next of node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.nextPositionNodeOrNull(Position.of(doc.root.id, 0))).toBe(node2);
            expect(doc.nextPositionNodeOrNull(Position.of(doc.root.id, 1))).toBeNull();
            expect(doc.nextPositionNodeOrNull(Position.of(doc.root.id, 2))).toBeNull();
        });
    });

    describe('prevSiblingNodeOrNull', () => {
        it('get prev of root node', () => {
            const doc = createDoc();
            expect(doc.prevSiblingNodeOrNull(doc.root.id)).toBeNull();
        });

        it('get prev of non-existent node', () => {
            const doc = createDoc();
            expect(doc.prevSiblingNodeOrNull(NON_EXISTENT_NODE_ID)).toBeNull();
        });

        it('get prev of node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.prevSiblingNodeOrNull(node1.id)).toBeNull();
            expect(doc.prevSiblingNodeOrNull(node2.id)).toBe(node1);
        });
    });

    describe('prevPositionNodeOrNull', () => {
        it('get next of root node', () => {
            const doc = createDoc();
            expect(doc.prevPositionNodeOrNull(Position.of(doc.root.id))).toBeNull();
        });

        it('get next of non-existent node', () => {
            const doc = createDoc();
            expect(doc.prevPositionNodeOrNull(Position.of(NON_EXISTENT_NODE_ID))).toBeNull();
        });

        it('get next of node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.prevPositionNodeOrNull(Position.of(doc.root.id, 0))).toBeNull();
            expect(doc.prevPositionNodeOrNull(Position.of(doc.root.id, 1))).toBe(node1);
            expect(doc.prevPositionNodeOrNull(Position.of(doc.root.id, 2))).toBe(node2);
        });
    });

    describe('findAncestor', () => {
        it('find ancestor of root node', () => {
            const doc = createDoc();
            expect(doc.findAncestor(doc.root.id, (node) => node instanceof RootNode)).toBe(doc.root);
        });

        it('find ancestor of non-existent node throws', () => {
            const doc = createDoc();
            expect(() => doc.findAncestor(NON_EXISTENT_NODE_ID, (node) => node instanceof RootNode)).toThrow();
        });

        it('find ancestor of node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(node1.id, node2);

            expect(doc.findAncestor(node2.id, (node) => node.id === node1.id)).toBe(node1);
        });
    });

    describe('insert', () => {
        it('insert into root node', () => {
            const doc = createDoc();
            const node = createNode();
            const newDoc = doc.insertLast(doc.root.id, node);

            expect(newDoc.get(node.id)).toBe(node);
            expect(newDoc.children(doc.root.id)).toEqual([node]);
        });

        it('insert into non-existent node', () => {
            const node = createNode();

            expect(() => createDoc().insert(Position.of(NON_EXISTENT_NODE_ID, 0), node)).toThrow();
        });

        it('insert into node', () => {
            let doc = createDoc();
            const node = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node);

            expect(doc.get(node.id)).toBe(node);
            expect(doc.children(doc.root.id)).toEqual([node]);
            expect(doc.children(node.id)).toEqual([]);
            expect(doc.parent(node.id).id).toBe(doc.root.id);
        });

        it('insert existing node will move nodes', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node11 = createNode();
            const node12 = createNode();
            const node13 = createNode();
            const node2 = createNode();
            const node21 = createNode();
            const node22 = createNode();
            const node221 = createNode();
            const node222 = createNode();
            const node223 = createNode();
            const node23 = createNode();
            const node3 = createNode();
            const node31 = createNode();
            const node32 = createNode();
            const node33 = createNode();
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

            expect(newDoc.children(doc.root.id)).toEqual([node1, node2, node22, node3]);
            expect(newDoc.children(node2.id)).toEqual([node21, node23]);
            expect(newDoc.children(node22.id)).toEqual([node221, node222, node223]);
            expect(newDoc.get(node2.id)).toBe(node2);
            expect(newDoc.get(node22.id)).toBe(node22);
            expect(newDoc.get(node221.id)).toBe(node221);
            expect(newDoc.get(node222.id)).toBe(node222);
            expect(newDoc.get(node223.id)).toBe(node223);
        });
    });

    describe('insertAfterOrNull', () => {
        it('insert after root node', () => {
            const doc = createDoc();
            const node = createNode();

            expect(() => doc.insertAfter(doc.root.id, node)).toThrow();
        });

        it('insert after non-existent node', () => {
            const doc = createDoc();
            const node = createNode();

            expect(() => doc.insertAfter(NON_EXISTENT_NODE_ID, node)).toThrow();
        });

        it('insert after node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insertAfter(node1.id, node2);

            expect(doc.get(node2.id)).toBe(node2);
            expect(doc.children(doc.root.id)).toEqual([node1, node2]);
        });
    });

    describe('insertBeforeOrNull', () => {
        it('insert before root node', () => {
            const doc = createDoc();
            const node = createNode();

            expect(() => doc.insertBefore(doc.root.id, node)).toThrow();
        });

        it('insert before non-existent node', () => {
            const doc = createDoc();
            const node = createNode();

            expect(() => doc.insertBefore(NON_EXISTENT_NODE_ID, node)).toThrow();
        });

        it('insert before node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insertBefore(node1.id, node2);

            expect(doc.get(node2.id)).toBe(node2);
            expect(doc.children(doc.root.id)).toEqual([node2, node1]);
        });
    });

    describe('insertFirstOrNull', () => {
        it('insert first into root node', () => {
            const doc = createDoc();
            const node = createNode();
            const newDoc = doc.insertFirst(doc.root.id, node);

            expect(doc.getOrNull(node.id)).toBeNull();
            expect(doc.children(doc.root.id)).toEqual([]);

            expect(newDoc.get(node.id)).toBe(node);
            expect(newDoc.children(doc.root.id)).toEqual([node]);
        });

        it('insert first into non-existent node throws', () => {
            expect(() => createDoc().insertFirst(999, createNode())).toThrow();
        });

        it('insert first into node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insertFirst(doc.root.id, node2);

            expect(doc.get(node2.id)).toBe(node2);
            expect(doc.children(doc.root.id)).toEqual([node2, node1]);
        });
    });

    describe('insertLastOrNull', () => {
        it('insert last into root node', () => {
            const doc = createDoc();
            const node = createNode();
            const newDoc = doc.insertLast(doc.root.id, node);

            expect(doc.getOrNull(node.id)).toBeNull();
            expect(doc.children(doc.root.id)).toEqual([]);

            expect(newDoc.get(node.id)).toBe(node);
            expect(newDoc.children(doc.root.id)).toEqual([node]);
        });

        it('insert last into non-existent node', () => {
            expect(() => createDoc().insertLast(999, createNode())).toThrow();
        });

        it('insert last into node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insertLast(doc.root.id, node2);

            expect(doc.get(node2.id)).toBe(node2);
            expect(doc.children(doc.root.id)).toEqual([node1, node2]);
        });
    });

    describe('delete', () => {
        it('delete root node', () => {
            const doc = createDoc();
            expect(() => doc.delete(doc.root.id)).toThrow();
        });

        it('delete non-existent node', () => {
            const doc = createDoc();
            expect(() => doc.delete(NON_EXISTENT_NODE_ID)).toThrow();
        });

        it('delete node', () => {
            let doc = createDoc();
            const node = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node);
            const newDoc = doc.delete(node.id).doc;

            expect(doc.get(node.id)).toBe(node);
            expect(newDoc.getOrNull(node.id)).toBeNull();
        });

        it('deleting a node will delete child nodes as well', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            const node11 = createNode();
            const node12 = createNode();
            const node21 = createNode();
            const node22 = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insert(Position.of(doc.root.id, 1), node2);
            doc = doc.insertLast(node1.id, node11);
            doc = doc.insertLast(node1.id, node12);
            doc = doc.insertLast(node2.id, node21);
            doc = doc.insertLast(node2.id, node22);
            const newDoc = doc.delete(node2.id).doc;

            expect(doc.get(node1.id)).toBe(node1);
            expect(doc.get(node2.id)).toBe(node2);
            expect(newDoc.get(node1.id)).toBe(node1);
            expect(newDoc.get(node11.id)).toBe(node11);
            expect(newDoc.get(node12.id)).toBe(node12);
            expect(newDoc.getOrNull(node2.id)).toBeNull();
            expect(newDoc.getOrNull(node21.id)).toBeNull();
            expect(newDoc.getOrNull(node22.id)).toBeNull();
        });
    });

    describe('splice', () => {
        it('splice root node', () => {
            const doc = createDoc();
            const node = createNode();
            const newDoc = doc.splice(doc.root.id, 0, 0, [node]);

            expect(newDoc.get(node.id)).toBe(node);
            expect(newDoc.children(doc.root.id)).toEqual([node]);
        });

        it('splice non-existent node', () => {
            expect(() => createDoc().splice(999, 0, 0, [createNode()])).toThrow();
        });

        it('splice node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            const newDoc = doc.splice(doc.root.id, 1, 0, [node2]);

            expect(newDoc.get(node2.id)).toBe(node2);
            expect(newDoc.children(doc.root.id)).toEqual([node1, node2]);
        });

        it('insert existing node will move nodes', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node11 = createNode();
            const node12 = createNode();
            const node13 = createNode();
            const node2 = createNode();
            const node21 = createNode();
            const node22 = createNode();
            const node221 = createNode();
            const node222 = createNode();
            const node223 = createNode();
            const node23 = createNode();
            const node3 = createNode();
            const node31 = createNode();
            const node32 = createNode();
            const node33 = createNode();
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
            expect(newDoc.children(doc.root.id)).toEqual([node1, node22, node3]);
            expect(newDoc.children(node22.id)).toEqual([node221, node222, node223]);
            expect(newDoc.get(node22.id)).toBe(node22);
            expect(newDoc.get(node221.id)).toBe(node221);
            expect(newDoc.get(node222.id)).toBe(node222);
            expect(newDoc.get(node223.id)).toBe(node223);
        });
    });

    describe('update', () => {
        it('update root node throws', () => {
            const doc = createDoc();
            expect(() => doc.update(doc.root.id, () => createNode())).toThrow();
        });

        it('update non-existent node', () => {
            const doc = createDoc();
            expect(() => doc.update(NON_EXISTENT_NODE_ID, () => createNode())).toThrow();
        });

        it('update node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            const newDoc = doc.update(node1.id, () => node2);

            expect(doc.get(node1.id)).toEqual(node1);
            expect(doc.getOrNull(node2.id)).toBeNull();
            expect(doc.children(doc.root.id)).toEqual([node1]);

            expect(newDoc.getOrNull(node1.id)).toBeNull();
            expect(newDoc.get(node2.id)).toEqual(node2);
            expect(newDoc.children(doc.root.id)).toEqual([node2]);
        });
    });

    describe('getFullPath', () => {
        it('get full path of root node', () => {
            const doc = createDoc();
            expect(doc.getFullPath(doc.root.id)).toEqual([doc.root.id]);
        });

        it('get full path of non-existent node', () => {
            const doc = createDoc();
            expect(() => doc.getFullPath(NON_EXISTENT_NODE_ID)).toThrow();
        });

        it('get full path of node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            const node3 = createNode();
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
            const doc = createDoc();
            expect(doc.compare(doc.root.id, doc.root.id)).toBe(0);
        });

        it('compare non-existent node', () => {
            const doc = createDoc();
            expect(() => doc.compare(NON_EXISTENT_NODE_ID, NON_EXISTENT_NODE_ID)).toThrow();
        });

        it('compare node', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            const node3 = createNode();
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
            let doc = createDoc();
            const node1 = createNode();
            const node2 = createNode();
            const node3 = createNode();
            doc = doc.insert(Position.of(doc.root.id, 0), node1);
            doc = doc.insert(Position.of(node1.id, 0), node2);
            doc = doc.insert(Position.of(node1.id, 1), node3);

            expect(doc.compare(Position.of(node1.id, 0), node2.id)).toBe(-1);
            expect(doc.compare(Position.of(node1.id, 1), node3.id)).toBe(-1);
            expect(doc.compare(Position.of(node1.id, 2), node3.id)).toBe(1);
        });
    });

    describe('split', () => {
        it('Split ContainerNode', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node11 = createNode();
            const node12 = createNode();
            const node13 = createNode();
            const node2 = createNode();
            const node21 = createNode();
            const node22 = createNode();
            const node221 = createNode();
            const node222 = createNode();
            const node223 = createNode();
            const node23 = createNode();
            const node3 = createNode();
            const node31 = createNode();
            const node32 = createNode();
            const node33 = createNode();
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

            const newDoc = doc.get(node2.id).split(doc, Position.of(node2.id, 2)).doc;
            const newNode = newDoc.nextSiblingNode(node2.id);
            expect(newNode.id).not.toBe(node3.id);
            expect(newDoc.children(doc.root.id)).toEqual([node1, node2, newNode, node3]);
            expect(newDoc.children(node2.id)).toEqual([node21, node22]);
            expect(newDoc.children(newNode.id)).toEqual([node23]);
        });

        it('Split TextNode', () => {
            let doc = createDoc();
            const node1 = new TextNode({ text: '0123456789' });
            doc = doc.insertLast(doc.root.id, node1);

            const newDoc = doc.get(node1.id).split(doc, Position.of(node1.id, 4)).doc;
            const newNode = newDoc.nextSiblingNode(node1.id);
            expect((newDoc.get(node1.id) as TextNode).text).toEqual('0123');
            expect((newDoc.get(newNode.id) as TextNode).text).toEqual('456789');
        });

        it('Split and merge ContainerNode get the original doc', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node11 = createNode();
            const node12 = createNode();
            const node13 = new TextNode({ text: 'test' });
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(node1.id, node11);
            doc = doc.insertLast(node1.id, node12);
            doc = doc.insertLast(node1.id, node13);

            const result = doc.get(node1.id).split(doc, Position.of(node1.id, 2));
            expect(result.doc.nextSiblingNode(node1.id)).not.toBeNull();

            const newDoc = result.doc.get(node1.id).merge(result.doc).doc;

            const serializer = new NodeSerializer();
            expect(serializer.serialize(newDoc)).toEqual(serializer.serialize(doc));
        });

        it('Split and merge TextNode get the original doc', () => {
            let doc = createDoc();
            const node1 = new TextNode({ text: '0123456789' });
            doc = doc.insertLast(doc.root.id, node1);

            let newDoc = doc;
            newDoc = newDoc.get(node1.id).split(newDoc, Position.of(node1.id, 4)).doc;

            expect(newDoc.nextSiblingNode(node1.id)).not.toBeNull();
            newDoc = newDoc.get(node1.id).merge(newDoc).doc;

            const serializer = new NodeSerializer();
            expect(serializer.serialize(newDoc)).toEqual(serializer.serialize(doc));
        });
    });

    describe('merge', () => {
        it('Merge ContainerNode', () => {
            let doc = createDoc();
            const node1 = createNode();
            const node11 = createNode();
            const node12 = createNode();
            const node13 = createNode();
            const node2 = createNode();
            const node21 = createNode();
            const node22 = createNode();
            const node221 = createNode();
            const node222 = createNode();
            const node223 = createNode();
            const node23 = createNode();
            const node3 = createNode();
            const node31 = createNode();
            const node32 = createNode();
            const node33 = createNode();
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

            const newDoc = node2.merge(doc).doc;
            expect(newDoc.get(node2.id)).toBe(node2);
            expect(newDoc.getOrNull(node3.id)).toBeNull();

            // node31 is merged with node23
            expect(newDoc.children(node2.id)).toEqual([node21, node22, node23, node32, node33]);
        });

        it('Merge TextNode', () => {
            let doc = createDoc();
            const node1 = new TextNode({ text: '0123' });
            const node2 = new TextNode({ text: '456789' });
            doc = doc.insertLast(doc.root.id, node1);
            doc = doc.insertLast(doc.root.id, node2);

            const newDoc = node1.merge(doc).doc;
            expect(newDoc.getOrNull(node1.id)).not.toBeNull();
            expect(newDoc.getOrNull(node2.id)).toBeNull();
            expect((newDoc.get(node1.id) as TextNode).text).toEqual('0123456789');
        });
    });

    describe('insertText', () => {
        it('insert into a TextNode', () => {
            let doc = createDoc();
            const textNode = new TextNode({ text: 'Hello, world!' });
            doc = doc.insertLast(doc.root.id, textNode);

            const { doc: newDoc, from, to } = doc.get(textNode.id).insertText(doc, 7, 'miracle ');

            expect(newDoc).not.toBe(doc);

            const newTextNode = newDoc.get(textNode.id) as TextNode;

            expect(newTextNode).not.toBe(textNode);
            expect(newTextNode.text).toBe('Hello, miracle world!');
            expect(from).toEqual(Position.of(newTextNode.id, 7));
            expect(to).toEqual(Position.of(newTextNode.id, 15));
        });

        it('insert after a TextNode', () => {
            let doc = createDoc();
            const textNode = new TextNode({ text: 'Hello, world!' });
            doc = doc.insertLast(doc.root.id, textNode);

            const { doc: newDoc, from, to } = doc.root.insertText(doc, 1, 'こんにちは世界');

            expect(newDoc).not.toBe(doc);

            const newTextNode = newDoc.get(to.nodeId) as TextNode;

            expect(newTextNode).not.toBe(textNode);
            expect(newTextNode.id).toBe(textNode.id);
            expect(newTextNode.text).toBe('Hello, world!こんにちは世界');
            expect(from).toEqual(Position.of(newTextNode.id, 13));
            expect(to).toEqual(Position.of(newTextNode.id, 20));
        });

        it('insert before a TextNode', () => {
            let doc = createDoc();
            const textNode = new TextNode({ text: 'Hello, world!' });
            doc = doc.insertLast(doc.root.id, textNode);

            const { doc: newDoc, from, to } = doc.root.insertText(doc, 0, 'こんにちは世界');

            expect(newDoc).not.toBe(doc);

            const newTextNode = newDoc.get(to.nodeId) as TextNode;

            expect(newTextNode).not.toBe(textNode);
            expect(newTextNode.id).toBe(textNode.id);
            expect(newTextNode.text).toBe('こんにちは世界Hello, world!');
            expect(from).toEqual(Position.of(newTextNode.id, 0));
            expect(to).toEqual(Position.of(newTextNode.id, 7));
        });

        it('insert into a ParagraphNode', () => {
            let doc = createDoc();
            const paragraph = new ParagraphNode();
            doc = doc.insertLast(doc.root.id, paragraph);

            const { doc: newDoc, from, to } = paragraph.insertText(doc, 0, 'Hello, world!');

            expect(newDoc).not.toBe(doc);

            const textNode = newDoc.get(from.nodeId) as TextNode;

            expect(textNode.text).toBe('Hello, world!');
            expect(from).toEqual(Position.of(textNode.id, 0));
            expect(to).toEqual(Position.of(textNode.id, 13));
        });

        it('insert into a RootNode', () => {
            const doc = createDoc();

            const { doc: newDoc, from, to } = doc.root.insertText(doc, 0, 'Hello, world!');

            expect(newDoc).not.toBe(doc);

            const textNode = newDoc.get(from.nodeId) as TextNode;

            expect(textNode.text).toBe('Hello, world!');
            expect(from).toEqual(Position.of(textNode.id, 0));
            expect(to).toEqual(Position.of(textNode.id, 13));
        });
    });
});
