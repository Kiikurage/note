import { Doc } from '../Doc';
import { TextNode } from '../node/TextNode';
import { insertText, insertTextAt } from './insertText';
import { Position } from '../Position';
import { ParagraphNode } from '../node/ParagraphNode';
import { EditorState } from '../EditorState';
import { Cursor } from '../Cursor';

describe('insertTextAt', () => {
    it('insert into a TextNode', () => {
        let doc = Doc.empty();
        const textNode = new TextNode({ text: 'Hello, world!' });
        doc = doc.insertLast(doc.root.id, textNode);

        const { doc: newDoc, positionFrom, positionTo } = insertTextAt(doc, Position.of(textNode.id, 7), 'miracle ');

        expect(newDoc).not.toBe(doc);

        const newTextNode = newDoc.get(textNode.id) as TextNode;

        expect(newTextNode).not.toBe(textNode);
        expect(newTextNode.text).toBe('Hello, miracle world!');
        expect(positionFrom).toEqual(Position.of(newTextNode.id, 7));
        expect(positionTo).toEqual(Position.of(newTextNode.id, 15));
    });

    it('insert after a TextNode', () => {
        let doc = Doc.empty();
        const textNode = new TextNode({ text: 'Hello, world!' });
        doc = doc.insertLast(doc.root.id, textNode);

        const {
            doc: newDoc,
            positionFrom,
            positionTo,
        } = insertTextAt(doc, Position.of(doc.root.id, 1), 'こんにちは世界');

        expect(newDoc).not.toBe(doc);

        const newTextNode = newDoc.get(positionTo.nodeId) as TextNode;

        expect(newTextNode).not.toBe(textNode);
        expect(newTextNode.id).toBe(textNode.id);
        expect(newTextNode.text).toBe('Hello, world!こんにちは世界');
        expect(positionFrom).toEqual(Position.of(newTextNode.id, 13));
        expect(positionTo).toEqual(Position.of(newTextNode.id, 20));
    });

    it('insert before a TextNode', () => {
        let doc = Doc.empty();
        const textNode = new TextNode({ text: 'Hello, world!' });
        doc = doc.insertLast(doc.root.id, textNode);

        const {
            doc: newDoc,
            positionFrom,
            positionTo,
        } = insertTextAt(doc, Position.of(doc.root.id, 0), 'こんにちは世界');

        expect(newDoc).not.toBe(doc);

        const newTextNode = newDoc.get(positionTo.nodeId) as TextNode;

        expect(newTextNode).not.toBe(textNode);
        expect(newTextNode.id).toBe(textNode.id);
        expect(newTextNode.text).toBe('こんにちは世界Hello, world!');
        expect(positionFrom).toEqual(Position.of(newTextNode.id, 0));
        expect(positionTo).toEqual(Position.of(newTextNode.id, 7));
    });

    it('insert into a ParagraphNode', () => {
        let doc = Doc.empty();
        const paragraph = new ParagraphNode({});
        doc = doc.insertLast(doc.root.id, paragraph);

        const {
            doc: newDoc,
            positionFrom,
            positionTo,
        } = insertTextAt(doc, Position.of(paragraph.id, 0), 'Hello, world!');

        expect(newDoc).not.toBe(doc);

        const textNode = newDoc.get(positionFrom.nodeId) as TextNode;

        expect(textNode.text).toBe('Hello, world!');
        expect(positionFrom).toEqual(Position.of(textNode.id, 0));
        expect(positionTo).toEqual(Position.of(textNode.id, 13));
    });

    it('insert into a RootNode', () => {
        const doc = Doc.empty();

        const {
            doc: newDoc,
            positionFrom,
            positionTo,
        } = insertTextAt(doc, Position.of(doc.root.id, 0), 'Hello, world!');

        expect(newDoc).not.toBe(doc);

        const textNode = newDoc.get(positionFrom.nodeId) as TextNode;

        expect(textNode.text).toBe('Hello, world!');
        expect(positionFrom).toEqual(Position.of(textNode.id, 0));
        expect(positionTo).toEqual(Position.of(textNode.id, 13));
    });
});

describe('insertText', () => {
    it('insert into a TextNode', () => {
        let state = EditorState.create();
        const textNode = new TextNode({ text: 'Hello, world!' });
        state = state.copy({
            doc: state.doc.insertLast(state.doc.root.id, textNode),
            cursor: Cursor.of(textNode.id, 7),
        });

        state = insertText(state, 'miracle ');

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

        state = insertText(state, 'miracle ');

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

        state = insertText(state, 'miracle ');

        const newTextNodeId = state.doc.get(textNode.id) as TextNode;
        expect(newTextNodeId.text).toEqual('miracle Hello, world!');
        expect(state.cursor).toEqual(Cursor.of(textNode.id, 8));
    });

    it('insert into a ParagraphNode', () => {
        let state = EditorState.create();
        const paragraph = new ParagraphNode({});
        state = state.copy({
            doc: state.doc.insertLast(state.doc.root.id, paragraph),
            cursor: Cursor.of(paragraph.id, 0),
        });

        state = insertText(state, 'miracle ');

        expect(state.cursor.collapsed).toBe(true);
        expect(state.doc.get(state.cursor.focus.nodeId)).toBeInstanceOf(TextNode);
        expect(state.doc.parent(state.cursor.focus.nodeId)).toBe(paragraph);
        expect(state.cursor.focus.offset).toBe(8);
    });

    it('insert into a RootNode', () => {
        let state = EditorState.create();

        state = insertText(state, 'miracle ');

        expect(state.cursor.collapsed).toBe(true);
        expect(state.doc.get(state.cursor.focus.nodeId)).toBeInstanceOf(TextNode);
        expect(state.cursor.focus.offset).toBe(8);

        const paragraph = state.doc.parent(state.cursor.focus.nodeId);
        expect(paragraph).toBeInstanceOf(ParagraphNode);

        expect(state.doc.parent(paragraph.id)).toBe(state.doc.root);
    });
});
