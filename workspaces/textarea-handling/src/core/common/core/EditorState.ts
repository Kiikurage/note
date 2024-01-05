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
}>() {
    static create() {
        const root = new RootNode({});

        return new EditorState({
            root,
            cursor: new Cursor({
                id: '1',
                anchor: Position.of(Path.of()),
                focus: Position.of(Path.of()),
            }),
        });
    }
}

const logger = Logger.of(EditorState);
