import { RootNode } from './node/RootNode';
import { createCursor, Cursor } from './Cursor';

export interface EditorState {
    root: RootNode;
    cursor: Cursor;
}

export function createEditorState(): EditorState {
    const root = new RootNode();
    return { root, cursor: createCursor(root, 0) };
}
