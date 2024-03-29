import { TextNode } from './TextNode';
import { ParagraphNode } from './ContainerNode';
import { RootNode } from './RootNode';
import { createPoint } from '../Point';

describe('RootNode', () => {
    describe('insertParagraph', () => {
        it('When there is no content, insert 2 paragraph nodes and focus the second one', () => {
            const rootNode = new RootNode();
            const result = rootNode.insertParagraph(0);
            expect(rootNode.children.length).toBe(2);
            expect(rootNode.children[0]).toBeInstanceOf(ParagraphNode);
            expect(rootNode.children[1]).toBeInstanceOf(ParagraphNode);
            expect(result).toEqual({
                from: createPoint(rootNode, 0),
                to: createPoint(rootNode, 1),
            });
        });

        it('When there is some content, insert 1 paragraph node and set cursor point after it', () => {
            const rootNode = new RootNode();
            const paragraph = new ParagraphNode();
            rootNode.insertLast(paragraph);
            const result = rootNode.insertParagraph(1);
            expect(rootNode.children.length).toBe(2);
            expect(rootNode.children[0]).toBe(paragraph);
            expect(rootNode.children[1]).toBeInstanceOf(ParagraphNode);
            expect(result).toEqual({
                from: createPoint(rootNode, 1),
                to: createPoint(rootNode, 2),
            });
        });
    });

    describe('deleteEnd', () => {
        it('deleteEnd does nothing', () => {
            const rootNode = new RootNode();
            const paragraph = new ParagraphNode();
            const text = new TextNode('Hello, world!');
            paragraph.insertLast(text);
            rootNode.insertLast(paragraph);

            const result = rootNode.deleteEnd();
            expect(result.point).toEqual(createPoint(rootNode, rootNode.length));
        });
    });
});
