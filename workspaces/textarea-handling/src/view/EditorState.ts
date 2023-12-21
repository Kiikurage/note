import { assert, dataclass, throwError } from '../lib';
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

    insertText(text: string) {
        let newState = this;
        for (const cursor of this.cursors) {
            newState = newState.insertTextAtCursor(cursor.id, text);
        }
        return newState;
    }

    setCompositionValue(value: string) {
        let newState = this;
        for (const cursor of this.cursors) {
            newState = newState.removeByRange(cursor.from, cursor.to);
        }
        return newState.copy({ compositionValue: value });
    }

    insertTextAtCursor(cursorId: string, text: string) {
        const cursor = this.cursors.find((c) => c.id === cursorId) ?? throwError(`Cursor(id=${cursorId}) is not found`);
        const newValue = this.value.slice(0, cursor.from) + text + this.value.slice(cursor.to);

        const newCursors = this.cursors.map((c) =>
            c.copy({
                anchor: c.anchor < cursor.from ? c.anchor : c.anchor + text.length - cursor.size,
                focus: c.focus < cursor.from ? c.focus : c.focus + text.length - cursor.size,
            }),
        );

        return this.copy({ value: newValue, cursors: newCursors });
    }

    removeBackward() {
        let newState = this;
        for (const cursor of this.cursors) {
            if (cursor.from === 0 && cursor.to === 0) continue;

            newState = newState.removeByRange(cursor.from === cursor.to ? cursor.from - 1 : cursor.from, cursor.to);
        }
        return newState;
    }

    removeForward() {
        let newState = this;
        for (const cursor of this.cursors) {
            if (cursor.from === this.length && cursor.to === this.length) continue;

            newState = newState.removeByRange(cursor.from, cursor.to === cursor.from ? cursor.to + 1 : cursor.to);
        }
        return newState;
    }

    removeByRange(from: number, to: number) {
        assert(from <= to, `from(${from}) <= to(${to})`);

        const newValue = this.value.slice(0, from) + this.value.slice(to);

        const newCursors = this.cursors.map((c) =>
            c.copy({
                anchor: c.anchor < from ? c.anchor : c.anchor < to ? from : c.anchor - (to - from),
                focus: c.focus < from ? c.focus : c.focus < to ? from : c.focus - (to - from),
            }),
        );

        return this.copy({ value: newValue, cursors: newCursors });
    }

    moveBackward() {
        return this.copy({
            cursors: this.cursors.map((cursor) => {
                if (cursor.size > 0) return cursor.copy({ anchor: cursor.from, focus: cursor.from });
                if (cursor.anchor === 0) return cursor;

                return cursor.copy({ anchor: cursor.anchor - 1, focus: cursor.focus - 1 });
            }),
        });
    }

    moveBackwardWithSelect() {
        return this.copy({
            cursors: this.cursors.map((cursor) =>
                cursor.focus === 0 ? cursor : cursor.copy({ focus: cursor.focus - 1 }),
            ),
        });
    }

    moveToLineBegin() {
        const r = /\n/g;
        const lineBeginOffsets = [0];
        while (r.exec(this.value)) {
            lineBeginOffsets.push(r.lastIndex);
        }

        return this.copy({
            cursors: this.cursors.map((cursor) => {
                const lineIndex = binarySearch(lineBeginOffsets, cursor.focus);
                const lineBeginOffset = lineBeginOffsets[lineIndex];

                return cursor.copy({ anchor: lineBeginOffset, focus: lineBeginOffset });
            }),
        });
    }

    moveToLineBeginWithSelect() {
        const r = /\n/g;
        const lineBeginOffsets = [0];
        while (r.exec(this.value)) {
            lineBeginOffsets.push(r.lastIndex);
        }

        return this.copy({
            cursors: this.cursors.map((cursor) => {
                const lineIndex = binarySearch(lineBeginOffsets, cursor.focus);
                const lineBeginOffset = lineBeginOffsets[lineIndex];

                return cursor.copy({ focus: lineBeginOffset });
            }),
        });
    }

    moveForward() {
        return this.copy({
            cursors: this.cursors.map((cursor) => {
                if (cursor.size > 0) return cursor.copy({ anchor: cursor.to, focus: cursor.to });
                if (cursor.anchor === this.length) return cursor;

                return cursor.copy({ anchor: cursor.anchor + 1, focus: cursor.focus + 1 });
            }),
        });
    }

    moveForwardWithSelect() {
        return this.copy({
            cursors: this.cursors.map((cursor) =>
                cursor.focus === this.length ? cursor : cursor.copy({ focus: cursor.focus + 1 }),
            ),
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

        return this.copy({
            cursors: this.cursors.map((cursor) => {
                const lineIndex = binarySearch(lineBeginOffsets, cursor.focus);
                const lineEndOffset = lineEndOffsets[lineIndex];

                return cursor.copy({ anchor: lineEndOffset, focus: lineEndOffset });
            }),
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

        return this.copy({
            cursors: this.cursors.map((cursor) => {
                const lineIndex = binarySearch(lineBeginOffsets, cursor.focus);
                const lineEndOffset = lineEndOffsets[lineIndex];

                return cursor.copy({ focus: lineEndOffset });
            }),
        });
    }

    selectAll() {
        return this.copy({
            cursors: this.cursors.map((cursor) => cursor.copy({ anchor: 0, focus: this.length })),
        });
    }
}
