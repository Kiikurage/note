import { TextNode } from './TextNode';
import { RootNode } from './RootNode';

describe('TextNode', () => {
    describe('insertText', () => {
        it('insert text', () => {
            const node = new TextNode('hello');
            const result = node.insertText(2, 'world');
            expect(node.text).toBe('heworldllo');
            expect(result).toEqual({ positionAfterInsertion: { node, offset: 7 } });
        });

        it('invalid insert position', () => {
            const node = new TextNode('hello');
            expect(() => node.insertText(9, 'world')).toThrow();
        });
    });

    describe('deleteContent', () => {
        it('normal pattern', () => {
            const node = new TextNode('hello');
            const result = node.deleteContent(1, 4);
            expect(node.text).toBe('ho');
            expect(result).toEqual({ positionAfterDeletion: { node, offset: 1 } });
        });

        it('delete all content', () => {
            const root = new RootNode();
            const node = new TextNode('hello');
            root.insertLast(node);
            const result = node.deleteContent(0, 5);
            expect(root.children).toHaveLength(0);
            expect(result).toEqual({ positionAfterDeletion: { node: root, offset: 0 } });
        });
    });

    describe('deleteContentBackward', () => {
        it('delete a character at middle', () => {
            const node = new TextNode('hello');
            const result = node.deleteContentBackward(2);
            expect(node.text).toBe('hllo');
            expect(result).toEqual({ positionAfterDeletion: { node, offset: 1 } });
        });

        it('delete a character at the beginning triggers deleteBegin', () => {
            const node = new TextNode('hello');
            const mockedDeleteBegin = jest.fn();
            node.deleteBegin = mockedDeleteBegin;

            node.deleteContentBackward(0);

            expect(node.text).toBe('hello');
            expect(mockedDeleteBegin.mock.calls).toHaveLength(1);
        });
    });

    describe('deleteContentForward', () => {
        it('delete a character at middle', () => {
            const node = new TextNode('hello');
            const result = node.deleteContentForward(1);
            expect(node.text).toBe('hllo');
            expect(result).toEqual({ positionAfterDeletion: { node, offset: 1 } });
        });

        it('delete a character at the end triggers deleteEnd', () => {
            const node = new TextNode('hello');
            const mockedDeleteEnd = jest.fn();
            node.deleteEnd = mockedDeleteEnd;

            node.deleteContentForward(5);

            expect(node.text).toBe('hello');
            expect(mockedDeleteEnd.mock.calls).toHaveLength(1);
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
            expect(result).toEqual({ positionAfterDeletion: { node: prev, offset: 4 } });
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
            expect(result).toEqual({ positionAfterDeletion: { node: next, offset: 0 } });
        });
    });
});
