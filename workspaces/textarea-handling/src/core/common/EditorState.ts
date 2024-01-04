import { assert, dataclass, isNotNullish } from '../../lib';
import { Cursor, Position } from './Cursor';
import { Node, Path, TextNode } from './Node';

export class EditorState extends dataclass<{
    root: Node;
    cursors: Cursor[];
}>() {
    static create() {
        return new EditorState({
            root: {
                type: 'root',
                children: [
                    // { type: 'block', children: [] },
                    // { type: 'block', children: [] },
                    // { type: 'block', children: [] },
                    // {
                    //     type: 'block',
                    //     children: [
                    //         { type: 'block', children: [] },
                    //         { type: 'block', children: [] },
                    //         { type: 'block', children: [] },
                    //         { type: 'text', value: 'Text4', children: [] } as TextNode,
                    //     ],
                    // },
                    { type: 'text', value: 'Text1', children: [] } as TextNode,
                    { type: 'block', children: [{ type: 'text', value: 'Text2', children: [] } as TextNode] },
                    { type: 'text', value: 'Text3', children: [] } as TextNode,
                    { type: 'block', children: [{ type: 'text', value: 'Text4', children: [] } as TextNode] },
                    { type: 'text', value: 'Text5', children: [] } as TextNode,
                ],
            },
            cursors: [
                new Cursor({
                    id: '1',
                    anchor: new Position({ path: Path.of(0), offset: 0 }),
                    focus: new Position({ path: Path.of(0), offset: 0 }),
                }),
            ],
        });
    }

    get head(): Position {
        return new Position({ path: Path.ROOT, offset: 0 });
    }

    get last(): Position {
        return new Position({ path: Node.last(this.root), offset: 0 });
    }

    updateCursor(cursor: Cursor) {
        const newCursors = this.cursors
            .map((c) => {
                if (c.id === cursor.id) {
                    // Ignore and add later since it may be modified by overlapping
                    return null;
                }

                if (cursor.isOverlapped(c)) {
                    if (cursor.direction === c.direction) {
                        // Merge
                        cursor =
                            cursor.direction === 'forward'
                                ? c.copy({
                                      anchor: Position.min(cursor.anchor, c.anchor),
                                      focus: Position.max(cursor.focus, c.focus),
                                  })
                                : c.copy({
                                      anchor: Position.max(cursor.anchor, c.anchor),
                                      focus: Position.min(cursor.focus, c.focus),
                                  });
                    }

                    return null;
                }

                return c;
            })
            .filter(isNotNullish);
        newCursors.push(cursor);

        return this.copy({ cursors: newCursors });
    }

    reduceWithEachCursor(predicate: (state: EditorState, cursor: Cursor) => EditorState) {
        return this.cursors
            .map((cursor) => cursor.id)
            .reduce((state: EditorState, cursorId) => {
                const cursor = state.cursors.find((c) => c.id === cursorId);
                if (cursor === undefined) {
                    // This cursor has been removed during update
                    return state;
                }

                return predicate(state, cursor);
            }, this);
    }

    insertNodeAt(path: Path, node: Node) {
        return this.copy({
            root: Node.insertNode(this.root, path, node),
        }).reduceWithEachCursor((state, cursor) => {
            function getNewPosition(oldPosition: Position): Position {
                const parentPath = path.parent();
                if (!parentPath.includes(oldPosition.path)) return oldPosition;

                if (oldPosition.path.compare(path) < 0) {
                    return oldPosition;
                } else {
                    return oldPosition.copy({ path: oldPosition.path.nextSibling() });
                }
            }

            return state.updateCursor(
                cursor.copy({
                    anchor: getNewPosition(cursor.anchor),
                    focus: getNewPosition(cursor.focus),
                }),
            );
        });
    }

    insertTextAt(position: Position, text: string): EditorState {
        const node = Node.getNode(this.root, position.path);
        assert(node !== null, 'node must not be undefined');
        if (!TextNode.isTextNode(node)) {
            const textNodePath = Path.of(...position.path.offsets, node.children.length);
            return this.insertNodeAt(textNodePath, TextNode.create()).insertTextAt(
                position.copy({ path: textNodePath, offset: 0 }),
                text,
            );
        }
        assert(position.offset <= node.value.length, 'offset must be less than or equal to node length');

        return this.copy({
            root: Node.updateNode(this.root, position.path, (node) => {
                assert(TextNode.isTextNode(node), 'node must be TextNode');
                return TextNode.setText(
                    node,
                    node.value.slice(0, position.offset) + text + node.value.slice(position.offset),
                );
            }),
        }).reduceWithEachCursor((state, cursor) => {
            function getNewPosition(oldPosition: Position): Position {
                if (!oldPosition.path.equals(position.path)) return oldPosition;
                if (oldPosition.offset < position.offset) return oldPosition;

                return oldPosition.copy({ offset: oldPosition.offset + text.length });
            }

            return state.updateCursor(
                cursor.copy({
                    anchor: getNewPosition(cursor.anchor),
                    focus: getNewPosition(cursor.focus),
                }),
            );
        });
    }

    insertText(text: string) {
        return this.deleteSelectedRanges().reduceWithEachCursor((state, cursor) => {
            const node = Node.getNode(this.root, cursor.from.path);
            assert(node !== null, 'node must not be null');

            if (!TextNode.isTextNode(node)) {
                const textNodePath = Path.of(...cursor.from.path.offsets, node.children.length);

                state = this.insertNodeAt(textNodePath, TextNode.create());
                cursor = cursor.copy({
                    anchor: cursor.anchor.copy({ path: textNodePath, offset: 0 }),
                    focus: cursor.focus.copy({ path: textNodePath, offset: 0 }),
                });

                state = state.copy({
                    cursors: state.cursors.map((c) => (c.id === cursor.id ? cursor : c)),
                });
            }

            return state.insertTextAt(cursor.from, text);
        });
    }

    deleteByRange(from: Position, to: Position) {
        if (from.path.equals(to.path)) {
            return this.copy({
                root: Node.updateNode(this.root, from.path, (node) => {
                    assert(TextNode.isTextNode(node), 'node must be TextNode');
                    return TextNode.setText(node, node.value.slice(0, from.offset) + node.value.slice(to.offset));
                }),
            }).reduceWithEachCursor((state, cursor) => {
                function getNewPosition(oldPosition: Position) {
                    if (!oldPosition.path.equals(from.path)) return oldPosition;

                    return oldPosition.copy({
                        offset:
                            oldPosition.offset < to.offset
                                ? Math.min(from.offset, oldPosition.offset)
                                : oldPosition.offset - (to.offset - from.offset),
                    });
                }
                return state.updateCursor(
                    cursor.copy({
                        anchor: getNewPosition(cursor.anchor),
                        focus: getNewPosition(cursor.focus),
                    }),
                );
            });
        }

        const subTreeRoots = Node.computeSubTreesForRange(this.root, from.path, to.path);

        let root = this.root;
        if (from.offset > 0) {
            root = Node.updateNode(root, from.path, (node) => {
                assert(TextNode.isTextNode(node), 'node must be TextNode');
                const newValue = node.value.slice(0, from.offset);
                from = from.copy({ path: from.path.nextSibling(), offset: 0 });

                return TextNode.setText(node, newValue);
            });
        }
        if (to.offset > 0) {
            root = Node.updateNode(root, to.path, (node) => {
                assert(TextNode.isTextNode(node), 'node must be TextNode');
                const newValue = node.value.slice(to.offset);
                to = to.copy({ offset: 0 });

                return TextNode.setText(node, newValue);
            });
        }

        return this.copy({
            root: Node.deleteByRange(root, from.path, to.path),
        }).reduceWithEachCursor((state, cursor) => {
            function getNewPath(oldPath: Path) {
                if (oldPath.compare(from.path) < 0) return oldPath;

                if (subTreeRoots.some((subTreeRoot) => subTreeRoot.includes(oldPath))) return from.path;

                const newOffsets = oldPath.offsets.slice();
                for (const removedPath of subTreeRoots) {
                    if (removedPath.depth > oldPath.depth) continue;

                    const oldSubPath = oldPath.slice(0, removedPath.depth);
                    if (oldSubPath.isSibling(removedPath) && removedPath.compare(oldSubPath) < 0) {
                        newOffsets[removedPath.depth - 1] -= 1;
                    }
                }

                return Path.of(...newOffsets);
            }

            return state.updateCursor(
                cursor.copy({
                    anchor: cursor.anchor.copy({ path: getNewPath(cursor.anchor.path) }),
                    focus: cursor.focus.copy({ path: getNewPath(cursor.focus.path) }),
                }),
            );
        });
    }

    deleteSelectedRanges() {
        return this.reduceWithEachCursor((state, cursor) => state.deleteByRange(cursor.from, cursor.to));
    }

    deleteBackward() {
        return this.reduceWithEachCursor((state, cursor) => {
            if (!cursor.collapsed) return state.deleteSelectedRanges();

            const prevPath = Node.getPrevPath(state.root, cursor.from.path);
            if (prevPath === null) return state;

            return state.deleteByRange(new Position({ path: prevPath, offset: 0 }), cursor.from);
        });
    }

    deleteForward() {
        return this.reduceWithEachCursor((state, cursor) => {
            if (!cursor.collapsed) return state.deleteSelectedRanges();

            const nextPath = Node.getNextPath(state.root, cursor.from.path);
            if (nextPath === null) return state;

            return state.deleteByRange(new Position({ path: nextPath, offset: 0 }), cursor.from);
        });
    }

    setCursorPosition(anchor: Position, focus: Position) {
        const newCursor = this.cursors[0].copy({
            anchor: Position.clamp(anchor, this.head, this.last),
            focus: Position.clamp(focus, this.head, this.last),
        });

        if (this.cursors.length === 1 && newCursor.toString() === this.cursors[0].toString()) return this;

        return this.copy({ cursors: [newCursor] });
    }
}
