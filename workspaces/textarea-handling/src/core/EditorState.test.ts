import { EditorState } from './EditorState';
import { TextNode } from './node/TextNode';
import { Cursor } from './Cursor';
import { ContainerNode, ParagraphNode } from './node/ContainerNode';

describe('EditorState', () => {
    describe('insertText', () => {
        it('insert into a TextNode', () => {
            let state = EditorState.create();
            const textNode = new TextNode({ text: 'Hello, world!' });
            state = state.copy({
                doc: state.doc.insertLast(state.doc.root.id, textNode),
                cursor: Cursor.of(textNode.id, 7),
            });

            state = state.insertText('miracle ');

            const newTextNodeId = state.doc.get(textNode.id) as TextNode;
            expect(newTextNodeId.text).toEqual('Hello, miracle world!');
            expect(state.cursor).toEqual(Cursor.of(textNode.id, 15));
        });

        it('insert after a TextNode', () => {
            let state = EditorState.create();
            const textNode = new TextNode({ text: 'Hello, world!' });
            state = state.copy({
                doc: state.doc.insertLast(state.doc.root.id, textNode),
                cursor: Cursor.of(state.doc.root.id, 1),
            });

            state = state.insertText('miracle ');

            const newTextNodeId = state.doc.get(textNode.id) as TextNode;
            expect(newTextNodeId.text).toEqual('Hello, world!miracle ');
            expect(state.cursor).toEqual(Cursor.of(textNode.id, 21));
        });

        it('insert before a TextNode', () => {
            let state = EditorState.create();
            const textNode = new TextNode({ text: 'Hello, world!' });
            state = state.copy({
                doc: state.doc.insertLast(state.doc.root.id, textNode),
                cursor: Cursor.of(state.doc.root.id, 0),
            });

            state = state.insertText('miracle ');

            const newTextNodeId = state.doc.get(textNode.id) as TextNode;
            expect(newTextNodeId.text).toEqual('miracle Hello, world!');
            expect(state.cursor).toEqual(Cursor.of(textNode.id, 8));
        });

        it('insert into a ParagraphNode', () => {
            let state = EditorState.create();
            const paragraph = new ParagraphNode();
            state = state.copy({
                doc: state.doc.insertLast(state.doc.root.id, paragraph),
                cursor: Cursor.of(paragraph.id, 0),
            });

            state = state.insertText('miracle ');

            expect(state.cursor.collapsed).toBe(true);
            expect(state.doc.get(state.cursor.focus.nodeId)).toBeInstanceOf(TextNode);
            expect(state.doc.parent(state.cursor.focus.nodeId)).toBe(paragraph);
            expect(state.cursor.focus.offset).toBe(8);
        });

        it('insert into a RootNode', () => {
            let state = EditorState.create();

            state = state.insertText('miracle ');

            expect(state.cursor.collapsed).toBe(true);
            expect(state.doc.get(state.cursor.focus.nodeId)).toBeInstanceOf(TextNode);
            expect(state.cursor.focus.offset).toBe(8);

            const paragraph = state.doc.parent(state.cursor.focus.nodeId);
            expect(paragraph).toBeInstanceOf(ParagraphNode);

            expect(state.doc.parent(paragraph.id)).toBe(state.doc.root);
        });
    });

    describe('deleteSelectedRange', () => {
        it('delete entire textNode', () => {
            let state = EditorState.create();
            const paragraph = new ParagraphNode();
            const textNode = new TextNode({ text: '01234' });

            state = state.copy({
                doc: state.doc.insertLast(state.doc.root.id, paragraph).insertLast(paragraph.id, textNode),
                cursor: Cursor.of(textNode.id, 0, 5),
            });
            state = state.deleteSelectedRange();

            expect(state.doc.children(state.doc.root.id)).toEqual([paragraph]);
            expect(state.doc.children(paragraph.id)).toEqual([]);
        });

        it('delete multiple textNodes in different paragraphs', () => {
            let state = EditorState.create();
            const paragraph1 = new ParagraphNode();
            const paragraph2 = new ParagraphNode();
            const textNode1 = new TextNode({ text: '01234' });
            const textNode2 = new TextNode({ text: '56789' });

            state = state.copy({
                doc: state.doc
                    .insertLast(state.doc.root.id, paragraph1)
                    .insertLast(paragraph1.id, textNode1)
                    .insertLast(state.doc.root.id, paragraph2)
                    .insertLast(paragraph2.id, textNode2),
                cursor: Cursor.of(textNode1.id, 0, textNode2.id, 5),
            });
            state = state.deleteSelectedRange();

            expect(state.doc.children(state.doc.root.id)).toEqual([paragraph1]);
        });
    });

    describe('deleteContentBackward', () => {
        it('delete text', () => {
            let state = EditorState.create();
            const paragraph = new ParagraphNode();
            const textNode = new TextNode({ text: '01234' });

            state = state.copy({
                doc: state.doc.insertLast(state.doc.root.id, paragraph).insertLast(paragraph.id, textNode),
                cursor: Cursor.of(textNode.id, 3, 3),
            });
            state = state.deleteContentBackward();

            expect((state.doc.get(textNode.id) as TextNode).text).toBe('0134');
            expect(state.cursor).toEqual(Cursor.of(textNode.id, 2));
        });

        it('delete empty paragraph', () => {
            let state = EditorState.create();
            const paragraph1 = new ParagraphNode();
            const textNode = new TextNode({ text: '01234' });
            const paragraph2 = new ParagraphNode();

            state = state.copy({
                doc: state.doc
                    .insertLast(state.doc.root.id, paragraph1)
                    .insertLast(state.doc.root.id, paragraph2)
                    .insertLast(paragraph1.id, textNode),
                cursor: Cursor.of(paragraph2.id, 0, 0),
            });
            state = state.deleteContentBackward();

            expect(state.doc.getOrNull(paragraph2.id)).toBeNull();
            expect(state.cursor).toEqual(Cursor.of(paragraph1.id, 1));
        });
    });
});
