import { dataclass, isNotNullish } from '../lib';
import { Cursor } from './Cursor';
import { binarySearch } from '../lib/binarySearch';

export class EditorState extends dataclass<{
    value: string;
    cursors: Cursor[];
    active: boolean;
    focused: boolean;
    compositionValue: string;
}>() {
    readonly timestamp = Date.now();

    static create(value: string = '') {
        return new EditorState({
            value,
            cursors: [new Cursor({ id: '1', anchor: 0, focus: 0 })],
            active: false,
            focused: false,
            compositionValue: '',
        });
    }

    get length() {
        return this.value.length;
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
                                      anchor: Math.min(cursor.anchor, c.anchor),
                                      focus: Math.max(cursor.focus, c.focus),
                                  })
                                : c.copy({
                                      anchor: Math.max(cursor.anchor, c.anchor),
                                      focus: Math.min(cursor.focus, c.focus),
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

    insertAt(at: number, text: string) {
        return this.copy({
            value: this.value.slice(0, at) + text + this.value.slice(at),
        }).reduceWithEachCursor((state, cursor) =>
            state.updateCursor(
                cursor.copy({
                    anchor: cursor.anchor < at ? cursor.anchor : cursor.anchor + text.length,
                    focus: cursor.focus < at ? cursor.focus : cursor.focus + text.length,
                }),
            ),
        );
    }

    removeByRange(from: number, to: number) {
        return this.copy({
            value: this.value.slice(0, from) + this.value.slice(to),
        }).reduceWithEachCursor((state, cursor) =>
            state.updateCursor(
                cursor.copy({
                    anchor: cursor.anchor < to ? Math.min(cursor.anchor, from) : cursor.anchor - (to - from),
                    focus: cursor.focus < to ? Math.min(cursor.focus, from) : cursor.focus - (to - from),
                }),
            ),
        );
    }

    insertText(text: string) {
        return this.reduceWithEachCursor((state, cursor) => {
            return state.removeByRange(cursor.from, cursor.to).insertAt(cursor.from, text);
        });
    }

    setCompositionValue(value: string) {
        return this.reduceWithEachCursor((state, cursor) => {
            return state.removeByRange(cursor.from, cursor.to);
        }).copy({
            compositionValue: value,
        });
    }

    removeBackward() {
        return this.reduceWithEachCursor((state, cursor) => {
            if (cursor.from === 0 && cursor.to === 0) return state;

            return state.removeByRange(cursor.from === cursor.to ? cursor.from - 1 : cursor.from, cursor.to);
        });
    }

    removeForward() {
        return this.reduceWithEachCursor((state, cursor) => {
            if (cursor.from === this.length && cursor.to === this.length) return state;

            return state.removeByRange(cursor.from, cursor.to === cursor.from ? cursor.to + 1 : cursor.to);
        });
    }

    moveBackward() {
        return this.reduceWithEachCursor((state, cursor) => {
            if (cursor.size > 0) return state.updateCursor(cursor.copy({ anchor: cursor.from, focus: cursor.from }));
            if (cursor.focus === 0) return state;

            return state.updateCursor(cursor.copy({ anchor: cursor.anchor - 1, focus: cursor.focus - 1 }));
        });
    }

    moveBackwardWithSelect() {
        return this.reduceWithEachCursor((state, cursor) => {
            if (cursor.focus === 0) return state;

            return state.updateCursor(cursor.copy({ focus: cursor.focus - 1 }));
        });
    }

    moveToLineBegin() {
        const r = /\n/g;
        const lineBeginOffsets = [0];
        while (r.exec(this.value)) {
            lineBeginOffsets.push(r.lastIndex);
        }

        return this.reduceWithEachCursor((state, cursor) => {
            const lineIndex = binarySearch(lineBeginOffsets, cursor.focus);
            const lineBeginOffset = lineBeginOffsets[lineIndex];

            return state.updateCursor(cursor.copy({ anchor: lineBeginOffset, focus: lineBeginOffset }));
        });
    }

    moveToLineBeginWithSelect() {
        const r = /\n/g;
        const lineBeginOffsets = [0];
        while (r.exec(this.value)) {
            lineBeginOffsets.push(r.lastIndex);
        }

        return this.reduceWithEachCursor((state, cursor) => {
            const lineIndex = binarySearch(lineBeginOffsets, cursor.focus);
            const lineBeginOffset = lineBeginOffsets[lineIndex];

            return state.updateCursor(cursor.copy({ focus: lineBeginOffset }));
        });
    }

    moveForward() {
        return this.reduceWithEachCursor((state, cursor) => {
            if (cursor.size > 0) return state.updateCursor(cursor.copy({ anchor: cursor.to, focus: cursor.to }));
            if (cursor.focus === this.length) return state;

            return state.updateCursor(cursor.copy({ anchor: cursor.anchor + 1, focus: cursor.focus + 1 }));
        });
    }

    moveForwardWithSelect() {
        return this.reduceWithEachCursor((state, cursor) => {
            if (cursor.focus === this.length) return state;

            return state.updateCursor(cursor.copy({ focus: cursor.focus + 1 }));
        });
    }

    moveToLineEnd() {
        const r = /\n/g;
        const lineBeginOffsets = [0];
        const lineEndOffsets: number[] = [];
        while (r.exec(this.value)) {
            lineEndOffsets.push(r.lastIndex - 1);
            lineBeginOffsets.push(r.lastIndex);
        }
        lineEndOffsets.push(this.length);

        return this.reduceWithEachCursor((state, cursor) => {
            const lineIndex = binarySearch(lineBeginOffsets, cursor.focus);
            const lineEndOffset = lineEndOffsets[lineIndex];

            return state.updateCursor(cursor.copy({ anchor: lineEndOffset, focus: lineEndOffset }));
        });
    }

    moveToLineEndWithSelect() {
        const r = /\n/g;
        const lineBeginOffsets = [0];
        const lineEndOffsets: number[] = [];
        while (r.exec(this.value)) {
            lineEndOffsets.push(r.lastIndex - 1);
            lineBeginOffsets.push(r.lastIndex);
        }
        lineEndOffsets.push(this.length);

        return this.reduceWithEachCursor((state, cursor) => {
            const lineIndex = binarySearch(lineBeginOffsets, cursor.focus);
            const lineEndOffset = lineEndOffsets[lineIndex];

            return state.updateCursor(cursor.copy({ focus: lineEndOffset }));
        });
    }

    selectAll() {
        return this.reduceWithEachCursor((state, cursor) => {
            return state.updateCursor(cursor.copy({ anchor: 0, focus: this.length }));
        });
    }
}
