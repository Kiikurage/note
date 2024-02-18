import { TextNode } from '../node/TextNode';
import { computeNodeRanges } from './computeNodeRanges';
import { createPoint } from '../Point';
import { ParagraphNode } from '../node/ContainerNode';
import { RootNode } from '../node/RootNode';

describe('computeNodeRanges', () => {
    it('single node', () => {
        const node = new TextNode('01234');

        const ranges = computeNodeRanges(createPoint(node, 1), createPoint(node, 3));

        expect(ranges).toEqual([{ node, from: 1, to: 3, includeBegin: false, includeEnd: false }]);
    });

    it('sibling nodes', () => {
        const text1 = new TextNode('01234');
        const text2 = new TextNode('56789');
        const paragraph = new ParagraphNode();
        paragraph.insertLast(text1);
        paragraph.insertLast(text2);

        const ranges = computeNodeRanges(createPoint(text1, 1), createPoint(text2, 3));

        expect(ranges).toEqual([
            { node: text1, from: 1, to: 5, includeBegin: false, includeEnd: true },
            { node: text2, from: 0, to: 3, includeBegin: true, includeEnd: false },
        ]);
    });

    it('multiple paragraph', () => {
        const text1 = new TextNode('11111');
        const text2 = new TextNode('22222');
        const text3 = new TextNode('33333');
        const paragraph1 = new ParagraphNode();
        const paragraph2 = new ParagraphNode();
        const paragraph3 = new ParagraphNode();
        const rootNode = new RootNode();
        rootNode.insertLast(paragraph1);
        rootNode.insertLast(paragraph2);
        rootNode.insertLast(paragraph3);
        paragraph1.insertLast(text1);
        paragraph2.insertLast(text2);
        paragraph3.insertLast(text3);

        const ranges = computeNodeRanges(createPoint(text1, 1), createPoint(text3, 3));

        expect(ranges).toEqual([
            { node: text1, from: 1, to: 5, includeBegin: false, includeEnd: true },
            { node: paragraph1, from: 1, to: 1, includeBegin: false, includeEnd: true },
            { node: paragraph2, from: 0, to: 1, includeBegin: true, includeEnd: true },
            { node: paragraph3, from: 0, to: 0, includeBegin: true, includeEnd: false },
            { node: text3, from: 0, to: 3, includeBegin: true, includeEnd: false },
        ]);
    });

    it('multiple nodes in different level', () => {
        const text1 = new TextNode('11111');
        const text2 = new TextNode('22222');
        const text3 = new TextNode('33333');
        const paragraph1 = new ParagraphNode();
        const paragraph2 = new ParagraphNode();
        const paragraph3 = new ParagraphNode();
        const rootNode = new RootNode();
        rootNode.insertLast(paragraph1);
        rootNode.insertLast(paragraph2);
        rootNode.insertLast(paragraph3);
        paragraph1.insertLast(text1);
        paragraph2.insertLast(text2);
        paragraph3.insertLast(text3);

        const ranges = computeNodeRanges(createPoint(text1, 1), createPoint(paragraph2, 1));

        expect(ranges).toEqual([
            { node: text1, from: 1, to: 5, includeBegin: false, includeEnd: true },
            { node: paragraph1, from: 1, to: 1, includeBegin: false, includeEnd: true },
            { node: paragraph2, from: 0, to: 1, includeBegin: true, includeEnd: false },
        ]);
    });

    it('multiple nodes in the same path', () => {
        const text1 = new TextNode('11111');
        const text2 = new TextNode('22222');
        const text3 = new TextNode('33333');
        const paragraph1 = new ParagraphNode();
        const paragraph2 = new ParagraphNode();
        const paragraph3 = new ParagraphNode();
        const rootNode = new RootNode();
        rootNode.insertLast(paragraph1);
        rootNode.insertLast(paragraph2);
        rootNode.insertLast(paragraph3);
        paragraph1.insertLast(text1);
        paragraph2.insertLast(text2);
        paragraph3.insertLast(text3);

        const ranges = computeNodeRanges(createPoint(text1, 1), createPoint(paragraph1, 1));

        expect(ranges).toEqual([{ node: text1, from: 1, to: 5, includeBegin: false, includeEnd: true }]);
    });
});
