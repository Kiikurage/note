import { RootNode } from '../node/RootNode';
import { ParagraphNode } from '../node/ContainerNode';
import { TextNode } from '../node/TextNode';
import { EditorState } from '../EditorState';
import { createCursor } from '../Cursor';
import { deleteByRange, deleteSelectedRange } from './deleteSelectedRange';
import { createPoint } from '../Point';

describe('deleteSelectedRange', () => {
    it('deletion makes "from" shifted', () => {
        const root = new RootNode();
        const paragraph1 = new ParagraphNode();
        const paragraph2 = new ParagraphNode();
        const textNode1 = new TextNode('Hello, ');
        const textNode2 = new TextNode('world!');

        root.insertLast(paragraph1);
        root.insertLast(paragraph2);
        paragraph1.insertLast(textNode1);
        paragraph2.insertLast(textNode2);

        let state: EditorState = { root, cursor: createCursor(root, 1, textNode2, 1) };
        state = deleteSelectedRange(state);

        expect(root.children).toEqual([paragraph1]);
        expect(paragraph1.children).toEqual([textNode1]);
        expect(textNode1.text).toBe('Hello, orld!');
        expect(state.cursor).toEqual(createCursor(textNode1, 7));
    });
});
