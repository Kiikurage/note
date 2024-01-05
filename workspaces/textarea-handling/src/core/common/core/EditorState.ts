import { dataclass } from '../../../lib';
import { Logger } from '../../../lib/logger';
import { RootNode } from '../node/RootNode';
import { Cursor } from './Cursor';
import { Path } from './Path';
import { Position } from './Position';
import { Node } from './Node';

export class EditorState extends dataclass<{
    root: Node;
    cursor: Cursor;
    debug: boolean;
}>() {
    static create() {
        const root = new RootNode({});

        return new EditorState({
            root,
            cursor: Cursor.of(Path.of()),
            debug: true,
        });
    }
}

const logger = Logger.of(EditorState);
