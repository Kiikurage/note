import { TextNode } from '../node/TextNode';
import { ParagraphNode } from '../node/ContainerNode';
import { insertNodesAtPoint } from './insertNodes';
import { createPoint } from '../Point';
import { RootNode } from '../node/RootNode';
import { assert } from '../../lib/assert';

describe('insertNodes', () => {
    describe('insert an inline node into an inline node', () => {
        it('insert at middle', () => {
            const text1 = new TextNode('text1');
            const text2 = new TextNode('text2');
            const paragraph = new ParagraphNode();
            paragraph.insertLast(text1);

            const result = insertNodesAtPoint(createPoint(text1, 1), [text2]);

            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 1 },
                insertedRangeTo: { node: text1, offset: 6 },
            });
            expect(paragraph.children.length).toBe(1);
            expect(paragraph.children[0]).toBe(text1);
            expect(text1.text).toBe('ttext2ext1');
        });

        it('insert at begin', () => {
            const text1 = new TextNode('text1');
            const text2 = new TextNode('text2');
            const paragraph = new ParagraphNode();
            paragraph.insertLast(text1);

            const result = insertNodesAtPoint(createPoint(text1, 0), [text2]);

            expect(paragraph.children.length).toBe(1);

            const text = paragraph.children[0];
            assert(text instanceof TextNode, 'text should be a TextNode');
            expect(text.text).toBe('text2text1');
            expect(result).toEqual({
                insertedRangeFrom: { node: text, offset: 0 },
                insertedRangeTo: { node: text, offset: 5 },
            });
        });

        it('insert at end', () => {
            const text1 = new TextNode('text1');
            const text2 = new TextNode('text2');
            const paragraph = new ParagraphNode();
            paragraph.insertLast(text1);

            const result = insertNodesAtPoint(createPoint(text1, 5), [text2]);

            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 5 },
                insertedRangeTo: { node: text1, offset: 10 },
            });
            expect(paragraph.children.length).toBe(1);
            expect(paragraph.children[0]).toBe(text1);
            expect(text1.text).toBe('text1text2');
        });
    });

    describe('insert a block node into an inline node', () => {
        it('insert at middle', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);
            const paragraph2 = new ParagraphNode();
            const text2 = new TextNode('text2');
            paragraph2.insertLast(text2);

            const result = insertNodesAtPoint(createPoint(text1, 1), [paragraph2]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('ttext2ext1');
            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 1 },
                insertedRangeTo: { node: text1, offset: 6 },
            });
        });

        it('insert at begin', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const paragraph2 = new ParagraphNode();
            const text2 = new TextNode('text2');
            paragraph2.insertLast(text2);

            const result = insertNodesAtPoint(createPoint(text1, 0), [paragraph2]);

            expect(root.children.length).toBe(1);
            const paragraph = root.children[0];
            assert(paragraph instanceof ParagraphNode, 'paragraph should be a ParagraphNode');

            expect(paragraph.children.length).toBe(1);
            const text = paragraph.children[0];
            assert(text instanceof TextNode, 'text should be a TextNode');

            expect(text.text).toBe('text2text1');
            expect(result).toEqual({
                insertedRangeFrom: { node: paragraph, offset: 0 },
                insertedRangeTo: { node: text, offset: 5 },
            });
        });

        it('insert at end', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const paragraph2 = new ParagraphNode();
            const text2 = new TextNode('text2');
            paragraph2.insertLast(text2);

            const result = insertNodesAtPoint(createPoint(text1, 5), [paragraph2]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text2');
            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 5 },
                insertedRangeTo: { node: paragraph1, offset: 1 },
            });
        });
    });

    describe('insert block nodes into an inline node', () => {
        it('insert at middle', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const paragraph2 = new ParagraphNode();
            const text2 = new TextNode('text2');
            paragraph2.insertLast(text2);

            const paragraph3 = new ParagraphNode();
            const text3 = new TextNode('text3');
            paragraph3.insertLast(text3);

            const result = insertNodesAtPoint(createPoint(text1, 2), [paragraph2, paragraph3]);

            expect(root.children.length).toBe(2);

            expect(root.children[0]).toBe(paragraph1);
            expect(paragraph1.children.length).toBe(1);

            expect(paragraph1.children[0]).toBe(text1);
            expect(text1.text).toBe('tetext2');

            const clonedParagraph3 = root.children[1];
            assert(clonedParagraph3 instanceof ParagraphNode, 'clonedParagraph3 should be a ParagraphNode');
            expect(clonedParagraph3.children.length).toBe(1);

            const clonedText3 = clonedParagraph3.children[0];
            assert(clonedText3 instanceof TextNode, 'clonedText3 should be a TextNode');
            expect(clonedText3.text).toBe('text3xt1');

            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 2 },
                insertedRangeTo: { node: clonedText3, offset: 5 },
            });
        });

        it('insert at begin', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const paragraph2 = new ParagraphNode();
            const text2 = new TextNode('text2');
            paragraph2.insertLast(text2);

            const paragraph3 = new ParagraphNode();
            const text3 = new TextNode('text3');
            paragraph3.insertLast(text3);

            const result = insertNodesAtPoint(createPoint(text1, 0), [paragraph2, paragraph3]);

            expect(root.children.length).toBe(2);

            const clonedParagraph2 = root.children[0];
            assert(clonedParagraph2 instanceof ParagraphNode, 'clonedParagraph2 should be a ParagraphNode');
            expect(clonedParagraph2.children.length).toBe(1);

            const clonedText2 = clonedParagraph2.children[0];
            assert(clonedText2 instanceof TextNode, 'clonedText3 should be a TextNode');
            expect(clonedText2.text).toBe('text2');

            const clonedParagraph3 = root.children[1];
            assert(clonedParagraph3 instanceof ParagraphNode, 'clonedParagraph3 should be a ParagraphNode');
            expect(clonedParagraph3.children.length).toBe(1);

            const clonedText3 = clonedParagraph3.children[0];
            assert(clonedText3 instanceof TextNode, 'clonedText3 should be a TextNode');
            expect(clonedText3.text).toBe('text3text1');

            expect(result).toEqual({
                insertedRangeFrom: { node: clonedParagraph2, offset: 0 },
                insertedRangeTo: { node: clonedText3, offset: 5 },
            });
        });

        it('insert at end', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const paragraph2 = new ParagraphNode();
            const text2 = new TextNode('text2');
            paragraph2.insertLast(text2);

            const paragraph3 = new ParagraphNode();
            const text3 = new TextNode('text3');
            paragraph3.insertLast(text3);

            const result = insertNodesAtPoint(createPoint(text1, 5), [paragraph2, paragraph3]);

            expect(root.children.length).toBe(2);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text2');

            const clonedParagraph3 = root.children[1];
            assert(clonedParagraph3 instanceof ParagraphNode, 'clonedParagraph3 should be a ParagraphNode');
            expect(clonedParagraph3.children.length).toBe(1);

            const clonedText3 = clonedParagraph3.children[0];
            assert(clonedText3 instanceof TextNode, 'clonedText3 should be a TextNode');
            expect(clonedText3.text).toBe('text3');

            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 5 },
                insertedRangeTo: { node: clonedParagraph3, offset: 1 },
            });
        });
    });

    describe('insert an inline node into a block node', () => {
        it('insert at middle', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            const text2 = new TextNode('text2');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);
            paragraph1.insertLast(text2);

            const text3 = new TextNode('text3');

            const result = insertNodesAtPoint(createPoint(paragraph1, 1), [text3]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text3text2');

            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 5 },
                insertedRangeTo: { node: text1, offset: 10 },
            });
        });

        it('insert at begin', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text2 = new TextNode('text2');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text2);

            const text3 = new TextNode('text3');

            const result = insertNodesAtPoint(createPoint(paragraph1, 0), [text3]);

            expect(root.children.length).toBe(1);
            const paragraph = root.children[0];
            assert(paragraph instanceof ParagraphNode, 'paragraph should be a ParagraphNode');

            expect(paragraph.children.length).toBe(1);
            const text = paragraph.children[0];
            assert(text instanceof TextNode, 'text should be a TextNode');

            expect(text.text).toBe('text3text2');

            expect(result).toEqual({
                insertedRangeFrom: { node: paragraph, offset: 0 },
                insertedRangeTo: { node: text, offset: 5 },
            });
        });

        it('insert at end', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const text3 = new TextNode('text3');

            const result = insertNodesAtPoint(createPoint(paragraph1, 1), [text3]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text3');

            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 5 },
                insertedRangeTo: { node: paragraph1, offset: 1 },
            });
        });
    });

    describe('insert a block node into a block node', () => {
        it('insert at middle', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            const text2 = new TextNode('text2');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);
            paragraph1.insertLast(text2);

            const paragraph2 = new ParagraphNode();
            const text3 = new TextNode('text3');
            paragraph2.insertLast(text3);

            const result = insertNodesAtPoint(createPoint(paragraph1, 1), [paragraph2]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text3text2');
            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 5 },
                insertedRangeTo: { node: text1, offset: 10 },
            });
        });

        it('insert into the RootNode', () => {
            const root = new RootNode();

            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const paragraph2 = new ParagraphNode();
            const text2 = new TextNode('text2');
            root.insertLast(paragraph2);
            paragraph2.insertLast(text2);

            const paragraph3 = new ParagraphNode();
            const text3 = new TextNode('text3');
            paragraph3.insertLast(text3);

            const result = insertNodesAtPoint(createPoint(root, 1), [paragraph3]);

            expect(root.children.length).toBe(3);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1');

            const paragraph = root.children[1];
            assert(paragraph instanceof ParagraphNode, 'paragraph should be a ParagraphNode');
            expect(paragraph.children.length).toBe(1);

            const text = paragraph.children[0];
            assert(text instanceof TextNode, 'text should be a TextNode');
            expect(text.text).toBe('text3');

            expect(root.children[2]).toBe(paragraph2);

            expect(paragraph2.children.length).toBe(1);
            expect(paragraph2.children[0]).toBe(text2);

            expect(text2.text).toBe('text2');

            expect(result).toEqual({
                insertedRangeFrom: { node: paragraph, offset: 0 },
                insertedRangeTo: { node: paragraph, offset: 1 },
            });
        });

        it('insert at begin', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text2 = new TextNode('text2');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text2);

            const paragraph2 = new ParagraphNode();
            const text3 = new TextNode('text3');
            paragraph2.insertLast(text3);

            const result = insertNodesAtPoint(createPoint(paragraph1, 0), [paragraph2]);

            expect(root.children.length).toBe(1);
            const paragraph = root.children[0];
            assert(paragraph instanceof ParagraphNode, 'paragraph should be a ParagraphNode');

            expect(paragraph.children.length).toBe(1);
            const text = paragraph.children[0];
            assert(text instanceof TextNode, 'text should be a TextNode');

            expect(text.text).toBe('text3text2');
            expect(result).toEqual({
                insertedRangeFrom: { node: paragraph, offset: 0 },
                insertedRangeTo: { node: text, offset: 5 },
            });
        });

        it('paragraph inserted at begin should not be merged with the previous paragraph', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const paragraph2 = new ParagraphNode();
            const text2 = new TextNode('text2');
            root.insertLast(paragraph2);
            paragraph2.insertLast(text2);

            const paragraph3 = new ParagraphNode();
            const text3 = new TextNode('text3');
            paragraph3.insertLast(text3);

            const result = insertNodesAtPoint(createPoint(paragraph2, 0), [paragraph3]);

            expect(root.children.length).toBe(2);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1');

            const paragraph = root.children[1];
            assert(paragraph instanceof ParagraphNode, 'paragraph should be a ParagraphNode');

            expect(paragraph.children.length).toBe(1);
            const text = paragraph.children[0];
            assert(text instanceof TextNode, 'text should be a TextNode');

            expect(text.text).toBe('text3text2');
            expect(result).toEqual({
                insertedRangeFrom: { node: paragraph, offset: 0 },
                insertedRangeTo: { node: text, offset: 5 },
            });
        });

        it('insert at end', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const paragraph2 = new ParagraphNode();
            const text3 = new TextNode('text3');
            paragraph2.insertLast(text3);

            const result = insertNodesAtPoint(createPoint(paragraph1, 1), [paragraph2]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text3');
            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 5 },
                insertedRangeTo: { node: paragraph1, offset: 1 },
            });
        });

        it('paragraph inserted at end should not be merged with the previous paragraph', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const paragraph2 = new ParagraphNode();
            const text2 = new TextNode('text2');
            root.insertLast(paragraph2);
            paragraph2.insertLast(text2);

            const paragraph3 = new ParagraphNode();
            const text3 = new TextNode('text3');
            paragraph3.insertLast(text3);

            const result = insertNodesAtPoint(createPoint(paragraph1, 1), [paragraph3]);

            expect(root.children.length).toBe(2);
            expect(root.children[0]).toBe(paragraph1);
            expect(root.children[1]).toBe(paragraph2);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text3');

            expect(paragraph2.children.length).toBe(1);
            expect(paragraph2.children[0]).toBe(text2);

            expect(text2.text).toBe('text2');

            expect(result).toEqual({
                insertedRangeFrom: { node: text1, offset: 5 },
                insertedRangeTo: { node: paragraph1, offset: 1 },
            });
        });
    });
});
