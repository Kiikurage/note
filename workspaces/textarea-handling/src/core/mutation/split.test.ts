import { Doc } from '../Doc';
import { split } from './split';
import { Position } from '../Position';
import { ContainerNode } from '../node/ContainerNode';
import { TextNode } from '../node/TextNode';
import { merge } from './merge';
import { NodeSerializer } from '../../serialize/NodeSerializer';

describe('split', () => {
    it('Split ContainerNode', () => {
        let doc = Doc.empty();
        const node1 = new ContainerNode({});
        const node11 = new ContainerNode({});
        const node12 = new ContainerNode({});
        const node13 = new ContainerNode({});
        const node2 = new ContainerNode({});
        const node21 = new ContainerNode({});
        const node22 = new ContainerNode({});
        const node221 = new ContainerNode({});
        const node222 = new ContainerNode({});
        const node223 = new ContainerNode({});
        const node23 = new ContainerNode({});
        const node3 = new ContainerNode({});
        const node31 = new ContainerNode({});
        const node32 = new ContainerNode({});
        const node33 = new ContainerNode({});
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

        const newDoc = split(doc, Position.of(node2.id, 2));
        const newNode = newDoc.nextSiblingNode(node2.id);
        expect(newNode.id).not.toBe(node3.id);
        expect(newDoc.childIds(doc.root.id)).toEqual([node1.id, node2.id, newNode.id, node3.id]);
        expect(newDoc.childIds(node2.id)).toEqual([node21.id, node22.id]);
        expect(newDoc.childIds(newNode.id)).toEqual([node23.id]);
    });

    it('Split TextNode', () => {
        let doc = Doc.empty();
        const node1 = new TextNode({ text: '0123456789' });
        doc = doc.insertLast(doc.root.id, node1);

        const newDoc = split(doc, Position.of(node1.id, 4));
        const newNode = newDoc.nextSiblingNode(node1.id);
        expect((newDoc.get(node1.id) as TextNode).text).toEqual('0123');
        expect((newDoc.get(newNode.id) as TextNode).text).toEqual('456789');
    });

    it('Split and merge ContainerNode get the original doc', () => {
        let doc = Doc.empty();
        const node1 = new ContainerNode({});
        const node11 = new ContainerNode({});
        const node12 = new ContainerNode({});
        const node13 = new ContainerNode({});
        const node2 = new ContainerNode({});
        const node21 = new ContainerNode({});
        const node22 = new ContainerNode({});
        const node221 = new ContainerNode({});
        const node222 = new ContainerNode({});
        const node223 = new ContainerNode({});
        const node23 = new ContainerNode({});
        const node3 = new ContainerNode({});
        const node31 = new ContainerNode({});
        const node32 = new ContainerNode({});
        const node33 = new ContainerNode({});
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

        let newDoc = doc;
        newDoc = split(newDoc, newDoc.endPosition(node22.id));
        expect(newDoc.nextSiblingNode(node2.id)).not.toBeNull();
        newDoc = merge(newDoc, newDoc.endPosition(node2.id));

        const serializer = new NodeSerializer();
        expect(serializer.serialize(newDoc)).toEqual(serializer.serialize(doc));
    });

    it('Split and merge TextNode get the original doc', () => {
        let doc = Doc.empty();
        const node1 = new TextNode({ text: '0123456789' });
        doc = doc.insertLast(doc.root.id, node1);

        let newDoc = doc;
        newDoc = split(newDoc, Position.of(node1.id, 4));
        expect(newDoc.nextSiblingNode(node1.id)).not.toBeNull();
        newDoc = merge(newDoc, newDoc.endPosition(node1.id));

        const serializer = new NodeSerializer();
        expect(serializer.serialize(newDoc)).toEqual(serializer.serialize(doc));
    });
});
