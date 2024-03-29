import { TextNode } from './TextNode';
import { assert } from '../../lib/assert';
import { ContainerNode, ParagraphNode } from './ContainerNode';
import { RootNode } from './RootNode';
import { deleteContentBackward } from '../operator/deleteContentBackward';

describe('ContainerNode', () => {
    describe('insertText', () => {
        it('if prev node is paragraph node, insert text there', () => {
            const containerNode = new ContainerNode();
            const paragraphNode = new ParagraphNode();
            containerNode.insertLast(paragraphNode);

            const result = containerNode.insertText(1, 'world');
            expect(paragraphNode.children.length).toBe(1);

            const textNode = paragraphNode.children[0];
            assert(textNode instanceof TextNode, `Expected a text node, but ${textNode.constructor.name}`);
            expect(textNode.text).toBe('world');

            expect(result).toEqual({
                from: { node: textNode, offset: 0 },
                to: { node: textNode, offset: 5 },
            });
        });

        it('if next node is paragraph node, insert text there', () => {
            const containerNode = new ContainerNode();
            const paragraphNode = new ParagraphNode();
            containerNode.insertLast(paragraphNode);

            const result = containerNode.insertText(0, 'world');
            expect(paragraphNode.children.length).toBe(1);

            const textNode = paragraphNode.children[0];
            assert(textNode instanceof TextNode, `Expected a text node, but ${textNode.constructor.name}`);
            expect(textNode.text).toBe('world');

            expect(result).toEqual({
                from: { node: textNode, offset: 0 },
                to: { node: textNode, offset: 5 },
            });
        });

        it('if both next and prev nodes are paragraph nodes, insert text to next node', () => {
            const containerNode = new ContainerNode();
            const prevParagraphNode = new ParagraphNode();
            const nextParagraphNode = new ParagraphNode();
            containerNode.insertLast(prevParagraphNode);
            containerNode.insertLast(nextParagraphNode);

            const result = containerNode.insertText(1, 'world');
            expect(prevParagraphNode.children.length).toBe(0);
            expect(nextParagraphNode.children.length).toBe(1);

            const textNode = nextParagraphNode.children[0];
            assert(textNode instanceof TextNode, `Expected a text node, but ${textNode.constructor.name}`);
            expect(textNode.text).toBe('world');

            expect(result).toEqual({
                from: { node: textNode, offset: 0 },
                to: { node: textNode, offset: 5 },
            });
        });

        it('if no paragraph node around the point, create a new one', () => {
            const containerNode = new ContainerNode();

            const result = containerNode.insertText(0, 'world');

            expect(containerNode.children.length).toBe(1);
            const paragraphNode = containerNode.children[0];
            assert(
                paragraphNode instanceof ParagraphNode,
                `Expected a paragraph node, but ${paragraphNode.constructor.name}`,
            );

            expect(paragraphNode.children.length).toBe(1);
            const textNode = paragraphNode.children[0];
            assert(textNode instanceof TextNode, `Expected a paragraph node, but ${textNode.constructor.name}`);

            expect(textNode.text).toBe('world');
            expect(result).toEqual({
                from: { node: textNode, offset: 0 },
                to: { node: textNode, offset: 5 },
            });
        });
    });

    describe('deleteContentBackward', () => {
        it('delegate to the child node', () => {
            const containerNode = new ContainerNode();
            const paragraphNode = new ParagraphNode();
            const textNode = new TextNode('hello');
            containerNode.insertLast(paragraphNode);
            paragraphNode.insertLast(textNode);

            const result = containerNode.deleteContentBackward(1);
            expect(textNode.text).toBe('hell');
            expect(result.point).toEqual({ node: textNode, offset: 4 });
        });

        it('delete at the begin will trigger deleteBegin', () => {
            const node = new ParagraphNode();
            const mockedDeleteBegin = jest.fn();
            node.deleteBegin = mockedDeleteBegin;

            node.deleteContentBackward(0);

            expect(mockedDeleteBegin.mock.calls).toHaveLength(1);
        });
    });

    describe('deleteContentForward', () => {
        it('delegate to the child node', () => {
            const containerNode = new ContainerNode();
            const paragraphNode = new ParagraphNode();
            const textNode = new TextNode('hello');
            containerNode.insertLast(paragraphNode);
            paragraphNode.insertLast(textNode);

            const result = containerNode.deleteContentForward(0);
            expect(textNode.text).toBe('ello');
            expect(result.point).toEqual({ node: textNode, offset: 0 });
        });

        it('delete at the end will trigger deleteEnd', () => {
            const node = new ParagraphNode();
            const mockedDeleteEnd = jest.fn();
            node.deleteEnd = mockedDeleteEnd;

            node.deleteContentForward(0);

            expect(mockedDeleteEnd.mock.calls).toHaveLength(1);
        });
    });

    describe('deleteEnd', () => {
        it('if next node is a container node, merge with it', () => {
            const root = new RootNode();
            const paragraphNode1 = new ParagraphNode();
            const textNode1 = new TextNode('hello ');
            const paragraphNode2 = new ParagraphNode();
            const textNode2 = new TextNode('world');

            root.insertLast(paragraphNode1);
            paragraphNode1.insertLast(textNode1);
            root.insertLast(paragraphNode2);
            paragraphNode2.insertLast(textNode2);

            const result = paragraphNode1.deleteEnd();
            expect(textNode1.text).toBe('hello world');
            expect(root.children).toEqual([paragraphNode1]);
            expect(result.point).toEqual({ node: textNode1, offset: 6 });
        });

        it('if no next node, delegate to parent', () => {
            const root = new RootNode();
            const containerNode1 = new ContainerNode();
            const paragraphNode1 = new ParagraphNode();
            const textNode1 = new TextNode('hello ');
            const containerNode2 = new ContainerNode();
            const paragraphNode2 = new ParagraphNode();
            const textNode2 = new TextNode('world');

            root.insertLast(containerNode1);
            containerNode1.insertLast(paragraphNode1);
            paragraphNode1.insertLast(textNode1);
            root.insertLast(containerNode2);
            containerNode2.insertLast(paragraphNode2);
            paragraphNode2.insertLast(textNode2);

            const result = containerNode1.deleteEnd();
            expect(textNode1.text).toBe('hello world');
            expect(root.children).toEqual([containerNode1]);
            expect(containerNode1.children).toEqual([paragraphNode1]);
            expect(result.point).toEqual({ node: textNode1, offset: 6 });
        });

        it('if no previous node nor parent, do nothing', () => {
            const node = new ParagraphNode();
            const result = node.deleteEnd();
            expect(result.point).toEqual({ node, offset: 0 });
        });
    });

    describe('deleteBegin', () => {
        it('if previous node is a container node, merge with it', () => {
            const root = new RootNode();
            const paragraphNode1 = new ParagraphNode();
            const textNode1 = new TextNode('hello ');
            const paragraphNode2 = new ParagraphNode();
            const textNode2 = new TextNode('world');

            root.insertLast(paragraphNode1);
            paragraphNode1.insertLast(textNode1);
            root.insertLast(paragraphNode2);
            paragraphNode2.insertLast(textNode2);

            const result = paragraphNode2.deleteBegin();
            expect(textNode1.text).toBe('hello world');
            expect(root.children).toEqual([paragraphNode1]);
            expect(result.point).toEqual({ node: textNode1, offset: 6 });
        });

        it('if no previous node, delegate to parent', () => {
            const root = new RootNode();
            const containerNode1 = new ContainerNode();
            const paragraphNode1 = new ParagraphNode();
            const textNode1 = new TextNode('hello ');
            const containerNode2 = new ContainerNode();
            const paragraphNode2 = new ParagraphNode();
            const textNode2 = new TextNode('world');

            root.insertLast(containerNode1);
            containerNode1.insertLast(paragraphNode1);
            paragraphNode1.insertLast(textNode1);
            root.insertLast(containerNode2);
            containerNode2.insertLast(paragraphNode2);
            paragraphNode2.insertLast(textNode2);

            const result = containerNode2.deleteBegin();
            expect(textNode1.text).toBe('hello world');
            expect(root.children).toEqual([containerNode1]);
            expect(containerNode1.children).toEqual([paragraphNode1]);
            expect(result.point).toEqual({ node: textNode1, offset: 6 });
        });

        it('if no previous node nor parent, do nothing', () => {
            const node = new ParagraphNode();
            const result = node.deleteBegin();
            expect(result.point).toEqual({ node, offset: 0 });
        });
    });

    describe('mergeWithNext', () => {
        it('Merge containers with their contents', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const paragraph2 = new ParagraphNode();
            const text1 = new TextNode('01234');
            const text2 = new TextNode('56789');

            root.insertLast(paragraph1);
            root.insertLast(paragraph2);
            paragraph1.insertLast(text1);
            paragraph2.insertLast(text2);

            const result = paragraph1.mergeWithNext();

            expect(root.children).toEqual([paragraph1]);
            expect(paragraph1.children).toEqual([text1]);
            expect(text1.text).toBe('0123456789');

            expect(result.point).toEqual({ node: text1, offset: 5 });

            expect(result.contents[0].dump()).toEqual({
                id: expect.anything(),
                type: 'ParagraphNode',
                children: [{ id: expect.anything(), type: 'TextNode', text: '' }],
            });
            expect(result.contents[1].dump()).toEqual({
                id: expect.anything(),
                type: 'ParagraphNode',
                children: [{ id: expect.anything(), type: 'TextNode', text: '' }],
            });
        });

        it('Merge empty containers', () => {
            const root = new RootNode();
            const paragraph1 = new ParagraphNode();
            const paragraph2 = new ParagraphNode();
            const text = new TextNode('12345');

            root.insertLast(paragraph1);
            root.insertLast(paragraph2);
            paragraph1.insertLast(text);

            const result = paragraph1.mergeWithNext();

            expect(root.children).toEqual([paragraph1]);
            expect(paragraph1.children).toEqual([text]);

            expect(result.point).toEqual({ node: text, offset: 5 });

            // Paragraph2 is empty, so merging is not happened in inline contents
            // and boundary nodes are not created neither
            expect(result.contents[0].dump()).toEqual({
                id: expect.anything(),
                type: 'ParagraphNode',
                children: [],
            });
            expect(result.contents[1].dump()).toEqual({
                id: expect.anything(),
                type: 'ParagraphNode',
                children: [],
            });
        });
    });
});

describe('ParagraphNode', () => {
    describe('insertText', () => {
        it('if prev node is text node, insert text there', () => {
            const paragraphNode = new ParagraphNode();
            const textNode = new TextNode('hello ');
            paragraphNode.insertLast(textNode);

            const result = paragraphNode.insertText(1, 'world');
            expect(textNode.text).toBe('hello world');
            expect(result).toEqual({
                from: { node: textNode, offset: 6 },
                to: { node: textNode, offset: 11 },
            });
        });

        it('if next node is text node, insert text there', () => {
            const paragraphNode = new ParagraphNode();
            const textNode = new TextNode('hello');
            paragraphNode.insertLast(textNode);

            const result = paragraphNode.insertText(0, 'world');
            expect(textNode.text).toBe('worldhello');
            expect(result).toEqual({
                from: { node: textNode, offset: 0 },
                to: { node: textNode, offset: 5 },
            });
        });

        it('if both next and prev nodes are text nodes, insert text to next node', () => {
            const paragraphNode = new ParagraphNode();
            const prevTextNode = new TextNode('hello');
            const nextTextNode = new TextNode('hello');
            paragraphNode.insertLast(prevTextNode);
            paragraphNode.insertLast(nextTextNode);

            const result = paragraphNode.insertText(1, 'world');
            expect(prevTextNode.text).toBe('hello');
            expect(nextTextNode.text).toBe('worldhello');
            expect(result).toEqual({
                from: { node: nextTextNode, offset: 0 },
                to: { node: nextTextNode, offset: 5 },
            });
        });

        it('if no text node around the point, create a new one', () => {
            const paragraphNode = new ParagraphNode();

            const result = paragraphNode.insertText(0, 'world');
            expect(paragraphNode.children.length).toBe(1);

            const node = paragraphNode.children[0];
            assert(node instanceof TextNode, `Expected a text node, but ${node.constructor.name}`);
            expect(node.text).toBe('world');

            expect(result).toEqual({
                from: { node, offset: 0 },
                to: { node, offset: 5 },
            });
        });
    });

    describe('deleteEnd', () => {
        it('if next node is a container node, move its children', () => {
            const root = new RootNode();
            const paragraphNode = new ParagraphNode();
            const textNode = new TextNode('hello ');
            const nextParagraphNode = new ParagraphNode();
            const nextTextNode = new TextNode('world');

            root.insertLast(paragraphNode);
            paragraphNode.insertLast(textNode);
            root.insertLast(nextParagraphNode);
            nextParagraphNode.insertLast(nextTextNode);

            const result = paragraphNode.deleteEnd();
            expect(textNode.text).toBe('hello world');
            expect(paragraphNode.children.length).toBe(1);
            expect(paragraphNode.children[0]).toBe(textNode);
            expect(paragraphNode.next).toBe(null);
            expect(result.point).toEqual({ node: textNode, offset: 6 });
        });
    });
});
