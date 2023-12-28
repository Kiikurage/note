import { caretPositionFromPoint } from '../lib/caretPositionFromPoint';
import { binarySearch } from '../lib/binarySearch';
import { findTextNode } from '../lib/findTextNode';
import { Channel, dataclass, Disposable } from '../lib';

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface ReadOnlyLayoutManagerState {
    getRectFromOffset(offset: number): Rect | null;

    getOffsetFromPosition(x: number, y: number): number | null;
}

export class LayoutManagerState
    extends dataclass<{
        baseElement: Element | null;
        textFragmentMap: ReadonlyMap<number, Element>;
    }>()
    implements ReadOnlyLayoutManagerState
{
    private getDocument() {
        return this.baseElement?.ownerDocument ?? null;
    }

    setTextFragment(fromOffset: number, element: Element) {
        if (this.textFragmentMap.get(fromOffset) === element) return this;

        const textFragmentMap = new Map(this.textFragmentMap);
        textFragmentMap.set(fromOffset, element);
        return this.copy({ textFragmentMap });
    }

    unsetTextFragment(fromOffset: number, element: Element) {
        if (this.textFragmentMap.get(fromOffset) !== element) return this;

        const textFragmentMap = new Map(this.textFragmentMap);
        textFragmentMap.delete(fromOffset);
        return this.copy({ textFragmentMap });
    }

    setBaseElement(baseElement: Element | null) {
        if (this.baseElement === baseElement) return this;

        return this.copy({ baseElement });
    }

    getRectFromOffset(offset: number): Rect | null {
        const baseElement = this.baseElement;
        const document = this.getDocument();
        if (baseElement === null || document === null) return null;

        const fragmentOffsets = [...this.textFragmentMap.keys()].sort((a, b) => a - b);
        const fragmentOffsetIndex = binarySearch(fragmentOffsets, offset);
        const fragmentOffset = fragmentOffsets[fragmentOffsetIndex];
        const fragment = this.textFragmentMap.get(fragmentOffset);

        if (fragment === undefined) return null;

        const node = findTextNode(fragment, offset - fragmentOffset);
        if (node === undefined) return null;

        const range = document.createRange();
        const result = { left: 0, top: 0, width: 0, height: 0 };

        if (offset - fragmentOffset + 1 >= (node.textContent?.length ?? 0)) {
            range.setStart(node, offset - fragmentOffset - 1);
            range.setEnd(node, offset - fragmentOffset);
            const rect = range.getBoundingClientRect();

            result.left = rect.left + rect.width;
            result.width = 0;
            result.top = rect.top;
            result.height = rect.height;
        } else {
            range.setStart(node, offset - fragmentOffset);
            range.setEnd(node, offset - fragmentOffset + 1);
            const rect = range.getBoundingClientRect();

            result.left = rect.left;
            result.width = rect.width;
            result.top = rect.top;
            result.height = rect.height;
        }

        const baseElementRect = baseElement.getBoundingClientRect();
        result.left -= baseElementRect.left;
        result.top -= baseElementRect.top;

        return result;
    }

    getOffsetFromPosition(x: number, y: number): number | null {
        const caretPosition = caretPositionFromPoint(document, x, y);
        if (caretPosition === null) return null;

        let node: Node | null = caretPosition.offsetNode;
        do {
            if (node instanceof HTMLElement) {
                if (node.dataset.rangeFrom) {
                    const rangeFrom = Number(node.dataset.rangeFrom);
                    return rangeFrom + caretPosition.offset;
                }
            }
            node = node.parentNode;
        } while (node !== null);

        return null;
    }
}

export class LayoutManager extends Disposable {
    readonly onChange = this.register(new Channel());
    private _state = new LayoutManagerState({
        baseElement: null,
        textFragmentMap: new Map(),
    });

    get state(): ReadOnlyLayoutManagerState {
        return this._state;
    }

    private set state(state: LayoutManagerState) {
        this._state = state;
        this.onChange.fire();
    }

    setTextFragment(fromOffset: number, element: Element) {
        this.state = this._state.setTextFragment(fromOffset, element);
    }

    unsetTextFragment(fromOffset: number, element: Element) {
        this.state = this._state.unsetTextFragment(fromOffset, element);
    }

    setBaseElement(element: Element | null) {
        this.state = this._state.setBaseElement(element);
    }
}
