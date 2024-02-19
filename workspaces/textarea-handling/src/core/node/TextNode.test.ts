import { TextNode } from './TextNode';
import { RootNode } from './RootNode';
import { deleteByRange } from '../operator/deleteSelectedRange';
import { insertNodesAtPoint } from '../operator/insertNodes';
import { ParagraphNode } from './ContainerNode';

describe('TextNode', () => {
    describe('insertText', () => {
        it('insert text', () => {
            const node = new TextNode('hello');
            const result = node.insertText(2, 'world');
            expect(node.text).toBe('heworldllo');
            expect(result).toEqual({
                from: { node, offset: 2 },
                to: { node, offset: 7 },
            });
        });

        it('invalid insert point', () => {
            const node = new TextNode('hello');
            expect(() => node.insertText(9, 'world')).toThrow();
        });

        describe('deletion after insertion restores the original state', () => {
            it('normal case', () => {
                const node = new TextNode('01234');

                const result = node.insertText(3, 'abcde');
                deleteByRange(result.from, result.to);

                expect(node.text).toBe('01234');
            });

            it('insert empty text', () => {
                const node = new TextNode('01234');

                const result = node.insertText(3, '');
                deleteByRange(result.from, result.to);

                expect(node.text).toBe('01234');
            });
        });
    });

    describe('deleteContent', () => {
        it('normal pattern', () => {
            const node = new TextNode('hello');
            const result = node.deleteContent(1, 4);
            expect(node.text).toBe('ho');
            expect(result.point).toEqual({ node, offset: 1 });
        });

        it('delete all content', () => {
            const root = new RootNode();
            const node = new TextNode('hello');
            root.insertLast(node);
            const result = node.deleteContent(0, 5);
            expect(root.children).toHaveLength(0);
            expect(result.point).toEqual({ node: root, offset: 0 });
        });

        describe('insertion after deletion restores the original state', () => {
            it('normal case', () => {
                const paragraph = new ParagraphNode();
                const text = new TextNode('01234');
                paragraph.insertLast(text);

                const result = text.deleteContent(1, 3);
                insertNodesAtPoint(result.point, result.contents);

                expect(text.text).toBe('01234');
            });

            it('delete empty text', () => {
                const paragraph = new ParagraphNode();
                const text = new TextNode('01234');
                paragraph.insertLast(text);

                const result = text.deleteContent(1, 1);
                insertNodesAtPoint(result.point, result.contents);

                expect(text.text).toBe('01234');
            });
        });
    });

    describe('deleteContentBackward', () => {
        it('delete a character at middle', () => {
            const node = new TextNode('hello');
            const result = node.deleteContentBackward(2);
            expect(node.text).toBe('hllo');
            expect(result.point).toEqual({ node, offset: 1 });
        });

        it('delete a character at the beginning triggers deleteBegin', () => {
            const node = new TextNode('hello');
            const mockedDeleteBegin = jest.fn();
            node.deleteBegin = mockedDeleteBegin;

            node.deleteContentBackward(0);

            expect(node.text).toBe('hello');
            expect(mockedDeleteBegin.mock.calls).toHaveLength(1);
        });

        describe('insertion after deletion restores the original state', () => {
            it('delete from middle of the node', () => {
                const paragraph = new ParagraphNode();
                const text = new TextNode('01234');
                paragraph.insertLast(text);

                const result = text.deleteContentBackward(3);
                insertNodesAtPoint(result.point, result.contents);

                expect(text.text).toBe('01234');
            });

            it('delete from the begin of the node, but not previous node', () => {
                const paragraph = new ParagraphNode();
                const text = new TextNode('01234');
                paragraph.insertLast(text);

                const result = text.deleteContentBackward(0);
                insertNodesAtPoint(result.point, result.contents);

                expect(text.text).toBe('01234');
            });

            it('delete from the begin of the node and previous node exists', () => {
                const paragraph = new ParagraphNode();
                const text1 = new TextNode('01234');
                const text2 = new TextNode('56789');
                paragraph.insertLast(text1);
                paragraph.insertLast(text2);

                const result = text2.deleteContentBackward(0);
                insertNodesAtPoint(result.point, result.contents);

                expect(text1.text).toBe('01234');
                expect(text2.text).toBe('56789');
            });

            it('delete from the begin of the node and parent has previous node', () => {
                const root = new RootNode();
                const paragraph1 = new ParagraphNode();
                const paragraph2 = new ParagraphNode();
                const text1 = new TextNode('01234');
                const text2 = new TextNode('56789');
                root.insertLast(paragraph1);
                root.insertLast(paragraph2);
                paragraph1.insertLast(text1);
                paragraph2.insertLast(text2);

                const result = text2.deleteContentBackward(0);
                insertNodesAtPoint(result.point, result.contents);

                expect(text1.text).toBe('01234');
                expect(text2.text).toBe('56789');
            });
        });
    });

    describe('deleteContentForward', () => {
        it('delete a character at middle', () => {
            const node = new TextNode('hello');
            const result = node.deleteContentForward(1);
            expect(node.text).toBe('hllo');
            expect(result.point).toEqual({ node, offset: 1 });
        });

        it('delete a character at the end triggers deleteEnd', () => {
            const node = new TextNode('hello');
            const mockedDeleteEnd = jest.fn();
            node.deleteEnd = mockedDeleteEnd;

            node.deleteContentForward(5);

            expect(node.text).toBe('hello');
            expect(mockedDeleteEnd.mock.calls).toHaveLength(1);
        });

        describe('insertion after deletion restores the original state', () => {
            it('delete from middle of the node', () => {
                const paragraph = new ParagraphNode();
                const text = new TextNode('01234');
                paragraph.insertLast(text);

                const result = text.deleteContentForward(3);
                insertNodesAtPoint(result.point, result.contents);

                expect(text.text).toBe('01234');
            });

            it('delete from the end of the node, but not next node', () => {
                const paragraph = new ParagraphNode();
                const text = new TextNode('01234');
                paragraph.insertLast(text);

                const result = text.deleteContentForward(5);
                insertNodesAtPoint(result.point, result.contents);

                expect(text.text).toBe('01234');
            });

            it('delete from the end of the node and next node exists', () => {
                const paragraph = new ParagraphNode();
                const text1 = new TextNode('01234');
                const text2 = new TextNode('56789');
                paragraph.insertLast(text1);
                paragraph.insertLast(text2);

                const result = text1.deleteContentForward(5);
                insertNodesAtPoint(result.point, result.contents);

                expect(text1.text).toBe('01234');
                const clonedText2 = paragraph.children[1] as TextNode;
                expect(clonedText2.text).toBe('56789');
            });

            it('delete from the end of the node and parent has next node', () => {
                const root = new RootNode();
                const paragraph1 = new ParagraphNode();
                const paragraph2 = new ParagraphNode();
                const text1 = new TextNode('01234');
                const text2 = new TextNode('56789');
                root.insertLast(paragraph1);
                root.insertLast(paragraph2);
                paragraph1.insertLast(text1);
                paragraph2.insertLast(text2);

                const result = text1.deleteContentForward(5);
                insertNodesAtPoint(result.point, result.contents);

                expect(text1.text).toBe('01234');
                expect(text2.text).toBe('56789');
            });
        });
    });

    describe('deleteBegin', () => {
        it('if previous node is text node, delete its last character', () => {
            const root = new RootNode();
            const node = new TextNode('world');
            const prev = new TextNode('hello');
            root.insertLast(node);
            node.insertBefore(prev);
            const result = node.deleteBegin();
            expect(node.text).toBe('world');
            expect(prev.text).toBe('hell');
            expect(result.point).toEqual({ node: prev, offset: 4 });
        });

        describe('insertion after deletion restores the original state', () => {
            it('no previous node', () => {
                const paragraph = new ParagraphNode();
                const text = new TextNode('01234');
                paragraph.insertLast(text);

                const result = text.deleteBegin();
                insertNodesAtPoint(result.point, result.contents);

                expect(text.text).toBe('01234');
            });

            it('previous node exists', () => {
                const paragraph = new ParagraphNode();
                const text1 = new TextNode('01234');
                const text2 = new TextNode('56789');
                paragraph.insertLast(text1);
                paragraph.insertLast(text2);

                const result = text2.deleteBegin();
                insertNodesAtPoint(result.point, result.contents);

                expect(text1.text).toBe('01234');
                expect(text2.text).toBe('56789');
            });

            it('parent has previous node', () => {
                const root = new RootNode();
                const paragraph1 = new ParagraphNode();
                const paragraph2 = new ParagraphNode();
                const text1 = new TextNode('01234');
                const text2 = new TextNode('56789');
                root.insertLast(paragraph1);
                root.insertLast(paragraph2);
                paragraph1.insertLast(text1);
                paragraph2.insertLast(text2);

                const result = text2.deleteBegin();
                insertNodesAtPoint(result.point, result.contents);

                expect(text1.text).toBe('01234');
                expect(text2.text).toBe('56789');
            });
        });
    });

    describe('deleteEnd', () => {
        it('if next node is text node, delete its first character', () => {
            const root = new RootNode();
            const node = new TextNode('hello');
            const next = new TextNode('world');
            root.insertLast(node);
            node.insertAfter(next);
            const result = node.deleteEnd();
            expect(node.text).toBe('hello');
            expect(next.text).toBe('orld');
            expect(result.point).toEqual({ node: next, offset: 0 });
        });

        describe('insertion after deletion restores the original state', () => {
            it('no next node', () => {
                const paragraph = new ParagraphNode();
                const text = new TextNode('01234');
                paragraph.insertLast(text);

                const result = text.deleteEnd();
                insertNodesAtPoint(result.point, result.contents);

                expect(text.text).toBe('01234');
            });

            it('next node exists', () => {
                const paragraph = new ParagraphNode();
                const text1 = new TextNode('01234');
                const text2 = new TextNode('56789');
                paragraph.insertLast(text1);
                paragraph.insertLast(text2);

                const result = text1.deleteEnd();
                insertNodesAtPoint(result.point, result.contents);

                expect(text1.text).toBe('01234');
                const clonedText2 = paragraph.children[1] as TextNode;
                expect(clonedText2.text).toBe('56789');
            });

            it('parent has next node', () => {
                const root = new RootNode();
                const paragraph1 = new ParagraphNode();
                const paragraph2 = new ParagraphNode();
                const text1 = new TextNode('01234');
                const text2 = new TextNode('56789');
                root.insertLast(paragraph1);
                root.insertLast(paragraph2);
                paragraph1.insertLast(text1);
                paragraph2.insertLast(text2);

                const result = text1.deleteEnd();
                insertNodesAtPoint(result.point, result.contents);

                expect(text1.text).toBe('01234');
                expect(text2.text).toBe('56789');
            });
        });
    });
});
