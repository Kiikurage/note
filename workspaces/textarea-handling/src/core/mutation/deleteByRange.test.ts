import { Doc } from '../Doc';
import { TextNode } from '../node/TextNode';
import { Position } from '../Position';
import { ParagraphNode } from '../node/ParagraphNode';
import { deleteAndMerge } from './deleteAndMerge';

describe('deleteByRange', () => {
    it('range is collapsed', () => {
        const textNode = new TextNode({ text: 'abc' });
        const paragraph = new ParagraphNode({});

        let doc = Doc.empty();
        doc = doc.insertLast(doc.root.id, paragraph);
        doc = doc.insertLast(paragraph.id, textNode);

        const result = deleteAndMerge(doc, Position.of(textNode.id, 1), Position.of(textNode.id, 1));

        expect(result.doc).toBe(doc);
        expect(result.from).toEqual(Position.of(textNode.id, 1));
        expect(result.to).toEqual(Position.of(textNode.id, 1));
    });

    it('both edges of the deletion range are in the same node', () => {
        const textNode = new TextNode({ text: 'ABCDEFGH' });
        const paragraph = new ParagraphNode({});

        let doc = Doc.empty();
        doc = doc.insertLast(doc.root.id, paragraph);
        doc = doc.insertLast(paragraph.id, textNode);

        const result = deleteAndMerge(doc, Position.of(textNode.id, 2), Position.of(textNode.id, 5));

        expect(result.from).toEqual(Position.of(textNode.id, 2));
        expect(result.to).toEqual(Position.of(textNode.id, 2));
        const newTextNode = result.doc.get(textNode.id) as TextNode;
        expect(newTextNode.text).toBe('ABFGH');
    });

    it('both nodes at the edge of the range have child nodes', () => {
        const node1 = new ParagraphNode({});
        const node11 = new ParagraphNode({});
        const node12 = new ParagraphNode({});
        const node13 = new ParagraphNode({});
        const node2 = new ParagraphNode({});
        const node21 = new ParagraphNode({});
        const node22 = new ParagraphNode({});
        const node23 = new ParagraphNode({});

        let doc = Doc.empty();
        doc = doc
            .insertLast(doc.root.id, node1)
            .insertLast(doc.root.id, node2)
            .insertLast(node1.id, node11)
            .insertLast(node1.id, node12)
            .insertLast(node1.id, node13)
            .insertLast(node2.id, node21)
            .insertLast(node2.id, node22)
            .insertLast(node2.id, node23);

        const result = deleteAndMerge(doc, Position.of(node1.id, 1), Position.of(node2.id, 2));

        expect(result.from).toEqual(Position.of(node1.id, 1));
    });

    it('both nodes at the edge of the range are TextNode', () => {
        const node1 = new ParagraphNode({});
        const node11 = new TextNode({ text: '01234' });
        const node12 = new ParagraphNode({});
        const node2 = new ParagraphNode({});
        const node21 = new ParagraphNode({});
        const node22 = new TextNode({ text: '56789' });

        let doc = Doc.empty();
        doc = doc
            .insertLast(doc.root.id, node1)
            .insertLast(doc.root.id, node2)
            .insertLast(node1.id, node11)
            .insertLast(node1.id, node12)
            .insertLast(node2.id, node21)
            .insertLast(node2.id, node22);

        const result = deleteAndMerge(doc, Position.of(node11.id, 2), Position.of(node22.id, 2));

        /**
         * root                  => root
         *   - node1                  - node1
         *     - node11: '01[234'       - node11: '01789'
         *     - node12
         *   - node2
         *     - node21
         *     - node22 '56]789'
         */

        expect(result.from).toEqual(Position.of(node11.id, 2));
        expect(result.to).toEqual(Position.of(node11.id, 2));
        expect(result.doc.get(node1.id)).toBe(node1);
        expect(result.doc.getOrNull(node2.id)).toBeNull();
        expect((result.doc.get(node11.id) as TextNode).text).toBe('01789');
        expect(result.doc.getOrNull(node12.id)).toBeNull();
        expect(result.doc.getOrNull(node21.id)).toBeNull();
        expect(result.doc.getOrNull(node22.id)).toBeNull();
    });
});
