import { TextNode } from '../node/TextNode';
import { ParagraphNode } from '../node/ContainerNode';
import { insertNodes } from './insertNodes';
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

            const point = insertNodes(createPoint(text1, 1), [text2]);

            expect(point).toEqual({ node: text1, offset: 6 });
            expect(paragraph.children.length).toBe(1);
            expect(paragraph.children[0]).toBe(text1);
            expect(text1.text).toBe('ttext2ext1');
        });

        it('insert at begin', () => {
            const text1 = new TextNode('text1');
            const text2 = new TextNode('text2');
            const paragraph = new ParagraphNode();
            paragraph.insertLast(text1);

            const point = insertNodes(createPoint(text1, 0), [text2]);

            expect(paragraph.children.length).toBe(1);

            const text = paragraph.children[0];
            assert(text instanceof TextNode, 'text should be a TextNode');
            expect(text.text).toBe('text2text1');
            expect(point).toEqual({ node: text, offset: 5 });
        });

        it('insert at end', () => {
            const text1 = new TextNode('text1');
            const text2 = new TextNode('text2');
            const paragraph = new ParagraphNode();
            paragraph.insertLast(text1);

            const point = insertNodes(createPoint(text1, 5), [text2]);

            expect(point).toEqual({ node: text1, offset: 10 });
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

            const point = insertNodes(createPoint(text1, 1), [paragraph2]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('ttext2ext1');
            expect(point).toEqual({ node: text1, offset: 6 });
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

            const point = insertNodes(createPoint(text1, 0), [paragraph2]);

            expect(root.children.length).toBe(1);
            const paragraph = root.children[0];
            assert(paragraph instanceof ParagraphNode, 'paragraph should be a ParagraphNode');

            expect(paragraph.children.length).toBe(1);
            const text = paragraph.children[0];
            assert(text instanceof TextNode, 'text should be a TextNode');

            expect(text.text).toBe('text2text1');
            expect(point).toEqual({ node: text, offset: 5 });
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

            const point = insertNodes(createPoint(text1, 5), [paragraph2]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text2');
            expect(point).toEqual({ node: text1, offset: 10 });
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

            const point = insertNodes(createPoint(paragraph1, 1), [text3]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text3text2');

            expect(point).toEqual({ node: text1, offset: 10 });
        });

        it('insert at begin', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text2 = new TextNode('text2');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text2);

            const text3 = new TextNode('text3');

            const point = insertNodes(createPoint(paragraph1, 0), [text3]);

            expect(root.children.length).toBe(1);
            const paragraph = root.children[0];
            assert(paragraph instanceof ParagraphNode, 'paragraph should be a ParagraphNode');

            expect(paragraph.children.length).toBe(1);
            const text = paragraph.children[0];
            assert(text instanceof TextNode, 'text should be a TextNode');

            expect(text.text).toBe('text3text2');

            expect(point).toEqual({ node: text, offset: 5 });
        });

        it('insert at end', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const text1 = new TextNode('text1');
            root.insertLast(paragraph1);
            paragraph1.insertLast(text1);

            const text3 = new TextNode('text3');

            const point = insertNodes(createPoint(paragraph1, 1), [text3]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text3');

            expect(point).toEqual({ node: text1, offset: 10 });
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

            const point = insertNodes(createPoint(paragraph1, 1), [paragraph2]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text3text2');
            expect(point).toEqual({ node: text1, offset: 10 });
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

            const point = insertNodes(createPoint(root, 1), [paragraph3]);

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

            expect(point).toEqual({ node: root, offset: 2 });
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

            const point = insertNodes(createPoint(paragraph1, 0), [paragraph2]);

            expect(root.children.length).toBe(1);
            const paragraph = root.children[0];
            assert(paragraph instanceof ParagraphNode, 'paragraph should be a ParagraphNode');

            expect(paragraph.children.length).toBe(1);
            const text = paragraph.children[0];
            assert(text instanceof TextNode, 'text should be a TextNode');

            expect(text.text).toBe('text3text2');
            expect(point).toEqual({ node: text, offset: 5 });
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

            const point = insertNodes(createPoint(paragraph2, 0), [paragraph3]);

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
            expect(point).toEqual({ node: text, offset: 5 });
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

            const point = insertNodes(createPoint(paragraph1, 1), [paragraph2]);

            expect(root.children.length).toBe(1);
            expect(root.children[0]).toBe(paragraph1);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text3');
            expect(point).toEqual({ node: text1, offset: 10 });
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

            const point = insertNodes(createPoint(paragraph1, 1), [paragraph3]);

            expect(root.children.length).toBe(2);
            expect(root.children[0]).toBe(paragraph1);
            expect(root.children[1]).toBe(paragraph2);

            expect(paragraph1.children.length).toBe(1);
            expect(paragraph1.children[0]).toBe(text1);

            expect(text1.text).toBe('text1text3');

            expect(paragraph2.children.length).toBe(1);
            expect(paragraph2.children[0]).toBe(text2);

            expect(text2.text).toBe('text2');

            expect(point).toEqual({ node: text1, offset: 10 });
        });
    });
});
