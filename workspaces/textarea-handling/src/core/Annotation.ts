import { EditorState } from './EditorState';
import { dataclass } from '../lib';
import { Cursor } from './Cursor';

interface Annotation {
    from: number;
    to: number;
    type: string;
}

export class CursorAnnotation
    extends dataclass<{
        cursor: Cursor;
    }>()
    implements Annotation
{
    readonly type = 'cursor';

    get from() {
        return this.cursor.from;
    }

    get to() {
        return this.cursor.to;
    }

    get direction() {
        return this.cursor.direction;
    }

    static create(cursor: Cursor) {
        return new CursorAnnotation({ cursor });
    }
}

export class CompositionAnnotation
    extends dataclass<{
        from: number;
        to: number;
    }>()
    implements Annotation
{
    readonly type = 'composition';
}

export class LineAnnotation
    extends dataclass<{
        line: number;
        from: number;
        to: number;
    }>()
    implements Annotation
{
    readonly type = 'line';
}

export class AnnotationRange extends dataclass<{
    from: number;
    to: number;
    annotations: Annotation[];
}>() {
    get cursor(): CursorAnnotation | undefined {
        return this.annotations.find((a) => a.type === 'cursor') as CursorAnnotation | undefined;
    }

    get composition(): CompositionAnnotation | undefined {
        return this.annotations.find((a) => a.type === 'composition') as CompositionAnnotation | undefined;
    }

    get line(): LineAnnotation | undefined {
        return this.annotations.find((a) => a.type === 'line') as LineAnnotation | undefined;
    }
}

export class AnnotationList {
    entries = new Map<
        number,
        {
            offset: number;
            start: Annotation[];
            end: Annotation[];
        }
    >();

    private getOrCreateEntry(offset: number) {
        let entry = this.entries.get(offset);
        if (entry === undefined) {
            entry = { offset, start: [], end: [] };
            this.entries.set(offset, entry);
        }
        return entry;
    }

    add<T extends Annotation>(annotation: T) {
        this.getOrCreateEntry(annotation.from).start.push(annotation);
        this.getOrCreateEntry(annotation.to).end.push(annotation);
    }

    toRanges(): AnnotationRange[] {
        if (this.entries.size === 0) return [];

        const entries = Array.from(this.entries.values()).sort((a, b) => a.offset - b.offset);
        const ranges: AnnotationRange[] = [];

        let offset = 0;
        const annotations = new Set<Annotation>();

        for (const entry of entries) {
            if (entry.start.length > 0) {
                ranges.push(
                    new AnnotationRange({ from: offset, to: entry.offset, annotations: Array.from(annotations) }),
                );
                offset = entry.offset;
                entry.start.forEach((annotation) => annotations.add(annotation));
            }
            if (entry.end.length > 0) {
                ranges.push(
                    new AnnotationRange({ from: offset, to: entry.offset, annotations: Array.from(annotations) }),
                );
                offset = entry.offset;
                entry.end.forEach((annotation) => annotations.delete(annotation));
            }
        }

        ranges.shift();
        return ranges;
    }

    static create(state: EditorState) {
        const list = new AnnotationList();

        let from = 0;
        state.value.split('\n').forEach((lineText, line) => {
            const to = Math.min(state.length, from + lineText.length + 1);
            list.add(new LineAnnotation({ from, to, line }));
            from = to;
        });

        state.compositionRanges.forEach((cursor) => {
            list.add(new CompositionAnnotation(cursor));
        });

        return list.toRanges();
    }
}
