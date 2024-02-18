import { RootNode } from './node/RootNode';
import { createCursor, Cursor, dumpCursor } from './Cursor';

export interface EditorState {
    root: RootNode;
    cursor: Cursor;
}

export function createEditorState(): EditorState {
    const root = new RootNode();
    return { root, cursor: createCursor(root, 0) };
}

export function dumpEditorState(state: EditorState) {
    return {
        root: state.root.dump(),
        cursor: dumpCursor(state.cursor),
    };
}
