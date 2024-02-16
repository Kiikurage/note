import { createPoint, Point } from '../common/Point';
import { registerComponent } from '../common/Editor';
import { DocNode } from '../common/node/DocNode';

export interface DOMPoint {
    node: Node;
    offset: number;
}

export class PointMap {
    private readonly map = new Map<Node, DocNode>();
    static readonly ComponentKey = registerComponent(() => new PointMap());

    register(domNode: Node, docNode: DocNode) {
        this.map.set(domNode, docNode);
    }

    unregister(node: Node) {
        this.map.delete(node);
    }

    getDOMPoint(point: Point): DOMPoint | null {
        let best: Node | null = null;
        for (const [htmlNode, node] of this.map) {
            if (node !== point.node) continue;
            best = htmlNode;
        }

        if (best === null) return null;

        return { node: best, offset: point.offset };
    }

    getPoint(domNode: Node, offset: number): Point | null {
        let current: Node | null = domNode;
        while (current !== null) {
            const docNode = this.map.get(current);
            if (docNode !== undefined) return createPoint(docNode, offset);
            current = current.parentElement;
        }
        return null;
    }

    getSelection(): { anchor: Point; focus: Point } | null {
        const selection = window.getSelection();
        if (selection === null) return null;
        if (selection.anchorNode === null || selection.focusNode === null) return null;

        const anchorPoint = this.getPoint(selection.anchorNode, selection.anchorOffset);
        const focusPoint = this.getPoint(selection.focusNode, selection.focusOffset);
        if (anchorPoint === null || focusPoint === null) return null;

        return { anchor: anchorPoint, focus: focusPoint };
    }

    setSelection(anchor: Point, focus: Point) {
        const selection = window.getSelection();
        if (selection === null) return;

        const anchorDOMPoint = this.getDOMPoint(anchor);
        const focusDOMPoint = this.getDOMPoint(focus);
        if (anchorDOMPoint === null || focusDOMPoint === null) return;

        selection.setBaseAndExtent(
            anchorDOMPoint.node,
            anchorDOMPoint.offset,
            focusDOMPoint.node,
            focusDOMPoint.offset,
        );
    }

    modifySelection(
        alter: 'extend' | 'move',
        direction: 'forward' | 'backward',
        granularity: 'lineboundary',
    ): { anchor: Point; focus: Point } | null {
        document.getSelection()?.modify(alter, direction, granularity);
        return this.getSelection();
    }
}
