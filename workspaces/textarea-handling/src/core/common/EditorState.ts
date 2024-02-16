import { DocNode } from './node/DocNode';
import { RootNode } from './node/RootNode';
import { Cursor } from './Cursor';

export interface EditorState {
    root: DocNode;
    cursor: Cursor;
}

export module EditorState {
    export function create(): EditorState {
        const root = new RootNode();
        return { root, cursor: Cursor.of(root, 0) };
    }
}
