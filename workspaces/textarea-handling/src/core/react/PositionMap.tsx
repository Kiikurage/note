import { Position } from '../common/Position';
import { registerComponent } from '../common/Editor';
import { DocNode } from '../common/node/DocNode';

export interface PositionInDom {
    node: Node;
    offset: number;
}

export class PositionMap {
    private readonly map = new Map<Node, DocNode>();
    static readonly ComponentKey = registerComponent(() => new PositionMap());

    register(domNode: Node, docNode: DocNode) {
        this.map.set(domNode, docNode);
    }

    unregister(node: Node) {
        this.map.delete(node);
    }

    getPositionInDOM(positionInModel: Position): PositionInDom | null {
        let best: Node | null = null;
        for (const [htmlNode, node] of this.map) {
            if (node !== positionInModel.node) continue;
            best = htmlNode;
        }

        if (best === null) return null;

        return { node: best, offset: positionInModel.offset };
    }

    getPositionInModel(domNode: Node, offset: number): Position | null {
        let current: Node | null = domNode;
        while (current !== null) {
            const docNode = this.map.get(current);
            if (docNode !== undefined) return Position.of(docNode, offset);
            current = current.parentElement;
        }
        return null;
    }

    getSelection(): { anchor: Position; focus: Position } | null {
        const selection = window.getSelection();
        if (selection === null) return null;
        if (selection.anchorNode === null || selection.focusNode === null) return null;

        const anchorPositionInModel = this.getPositionInModel(selection.anchorNode, selection.anchorOffset);
        const focusPositionInModel = this.getPositionInModel(selection.focusNode, selection.focusOffset);
        if (anchorPositionInModel === null || focusPositionInModel === null) return null;

        return { anchor: anchorPositionInModel, focus: focusPositionInModel };
    }

    setSelection(anchor: Position, focus: Position) {
        const selection = window.getSelection();
        if (selection === null) return;

        const anchorPositionInDOM = this.getPositionInDOM(anchor);
        const focusPositionInDOM = this.getPositionInDOM(focus);
        if (anchorPositionInDOM === null || focusPositionInDOM === null) return;

        selection.setBaseAndExtent(
            anchorPositionInDOM.node,
            anchorPositionInDOM.offset,
            focusPositionInDOM.node,
            focusPositionInDOM.offset,
        );
    }

    modifySelection(
        alter: 'extend' | 'move',
        direction: 'forward' | 'backward',
        granularity: 'lineboundary',
    ): { anchor: Position; focus: Position } | null {
        document.getSelection()?.modify(alter, direction, granularity);
        return this.getSelection();
    }
}
