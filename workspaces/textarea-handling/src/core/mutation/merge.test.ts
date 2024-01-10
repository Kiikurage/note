import { Doc } from '../Doc';
import { ContainerNode } from '../node/ContainerNode';
import { TextNode } from '../node/TextNode';
import { merge } from './merge';
import { Position } from '../Position';

describe('merge', () => {
    it('Merge ContainerNode', () => {
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

        const newDoc = merge(doc, doc.endPosition(node2.id));
        expect(newDoc.get(node2.id)).toBe(node2);
        expect(newDoc.getOrNull(node3.id)).toBeNull();
        expect(newDoc.childIds(node2.id)).toEqual([node21.id, node22.id, node23.id, node31.id, node32.id, node33.id]);
    });

    it('Merge TextNode', () => {
        let doc = Doc.empty();
        const node1 = new TextNode({ text: '0123' });
        const node2 = new TextNode({ text: '456789' });
        doc = doc.insertLast(doc.root.id, node1);
        doc = doc.insertLast(doc.root.id, node2);

        const newDoc = merge(doc, doc.endPosition(node1.id));
        expect(newDoc.getOrNull(node1.id)).not.toBeNull();
        expect(newDoc.getOrNull(node2.id)).toBeNull();
        expect((newDoc.get(node1.id) as TextNode).text).toEqual('0123456789');
    });
});
