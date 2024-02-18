import { TextNode } from '../node/TextNode';
import { cloneTree } from './cloneTree';
import { createPoint } from '../Point';
import { ParagraphNode } from '../node/ContainerNode';
import { RootNode } from '../node/RootNode';
import { assert } from '../../lib/assert';

describe('cloneTree', () => {
    it('single node', () => {
        const node = new TextNode('01234');

        const clone = cloneTree(node);

        assert(clone instanceof TextNode, 'clone should be a TextNode');
        expect(clone.text).toBe('01234');
    });

    it('single node with children', () => {
        const text1 = new TextNode('01234');
        const text2 = new TextNode('56789');
        const paragraph = new ParagraphNode();
        paragraph.insertLast(text1);
        paragraph.insertLast(text2);

        const clonedParagraph = cloneTree(paragraph);
        assert(clonedParagraph instanceof ParagraphNode, 'clonedParagraph should be a ParagraphNode');
        expect(clonedParagraph.children.length).toBe(2);

        const clonedText1 = clonedParagraph.children[0];
        assert(clonedText1 instanceof TextNode, 'clonedText1 should be a TextNode');
        expect(clonedText1.text).toBe('01234');

        const clonedText2 = clonedParagraph.children[1];
        assert(clonedText2 instanceof TextNode, 'clonedText2 should be a TextNode');
        expect(clonedText2.text).toBe('56789');
    });

    it('range for a single node', () => {
        const node = new TextNode('01234');

        const clones = cloneTree(createPoint(node, 1), createPoint(node, 3));
        expect(clones.length).toBe(1);

        const clonedNode = clones[0];
        assert(clonedNode instanceof TextNode, 'clonedNode should be a TextNode');
        expect(clonedNode.text).toBe('12');
    });

    it('sibling nodes', () => {
        const text1 = new TextNode('01234');
        const text2 = new TextNode('56789');
        const paragraph = new ParagraphNode();
        paragraph.insertLast(text1);
        paragraph.insertLast(text2);

        const clones = cloneTree(createPoint(text1, 1), createPoint(text2, 3));
        expect(clones.length).toBe(2);

        const clonedText1 = clones[0];
        assert(clonedText1 instanceof TextNode, 'clonedText1 should be a TextNode');
        expect(clonedText1.text).toBe('1234');

        const clonedText2 = clones[1];
        assert(clonedText2 instanceof TextNode, 'clonedText2 should be a TextNode');
        expect(clonedText2.text).toBe('567');
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

        const clones = cloneTree(createPoint(text1, 1), createPoint(text3, 3));
        expect(clones.length).toBe(3);

        const clonedParagraph1 = clones[0];
        assert(clonedParagraph1 instanceof ParagraphNode, 'clonedParagraph1 should be a ParagraphNode');
        expect(clonedParagraph1.children.length).toBe(1);

        const clonedText1 = clonedParagraph1.children[0];
        assert(clonedText1 instanceof TextNode, 'clonedText1 should be a TextNode');
        expect(clonedText1.text).toBe('1111');

        const clonedParagraph2 = clones[1];
        assert(clonedParagraph2 instanceof ParagraphNode, 'clonedParagraph2 should be a ParagraphNode');
        expect(clonedParagraph2.children.length).toBe(1);

        const clonedText2 = clonedParagraph2.children[0];
        assert(clonedText2 instanceof TextNode, 'clonedText2 should be a TextNode');
        expect(clonedText2.text).toBe('22222');

        const clonedParagraph3 = clones[2];
        assert(clonedParagraph3 instanceof ParagraphNode, 'clonedParagraph3 should be a ParagraphNode');
        expect(clonedParagraph3.children.length).toBe(1);

        const clonedText3 = clonedParagraph3.children[0];
        assert(clonedText3 instanceof TextNode, 'clonedText3 should be a TextNode');
        expect(clonedText3.text).toBe('333');
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

        const clones = cloneTree(createPoint(text1, 1), createPoint(paragraph2, 1));
        expect(clones.length).toBe(2);

        const clonedParagraph1 = clones[0];
        assert(clonedParagraph1 instanceof ParagraphNode, 'clonedParagraph1 should be a ParagraphNode');
        expect(clonedParagraph1.children.length).toBe(1);

        const clonedText1 = clonedParagraph1.children[0];
        assert(clonedText1 instanceof TextNode, 'clonedText1 should be a TextNode');
        expect(clonedText1.text).toBe('1111');

        const clonedParagraph2 = clones[1];
        assert(clonedParagraph2 instanceof ParagraphNode, 'clonedParagraph2 should be a ParagraphNode');
        expect(clonedParagraph2.children.length).toBe(1);

        const clonedText2 = clonedParagraph2.children[0];
        assert(clonedText2 instanceof TextNode, 'clonedText2 should be a TextNode');
        expect(clonedText2.text).toBe('22222');
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

        const clones = cloneTree(createPoint(text1, 1), createPoint(paragraph1, 1));
        expect(clones.length).toBe(1);

        const clonedText1 = clones[0];
        assert(clonedText1 instanceof TextNode, 'clonedText1 should be a TextNode');
        expect(clonedText1.text).toBe('1111');
    });
});
