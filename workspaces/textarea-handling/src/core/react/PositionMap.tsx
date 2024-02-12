import { DIContainer } from '../../lib/DIContainer';
import { Position } from '../common/Position';
import { Cursor } from '../common/Cursor';

export interface PositionInDom {
    node: Node;
    offset: number;
}

export class PositionMap {
    private readonly map = new Map<Node, Position>();
    static readonly ServiceKey = DIContainer.register(() => new PositionMap());

    register(node: Node, position: Position) {
        this.map.set(node, position);
    }

    unregister(node: Node) {
        this.map.delete(node);
    }

    getPositionInDOM(positionInModel: Position): PositionInDom | null {
        let best: PositionInDom | null = null;
        for (const [htmlNode, { node, offset }] of this.map) {
            if (node !== positionInModel.node) continue;
            if (offset > positionInModel.offset) continue;
            if (best === null || best.offset < offset) {
                best = { node: htmlNode, offset };
            }
        }

        if (best === null) return null;

        return { node: best.node, offset: positionInModel.offset - best.offset };
    }

    getPositionInModel(node: Node, offset: number): Position | null {
        let best: Position | null = null;
        for (const entry of this.map) {
            if (entry[0] !== node) continue;
            if (entry[1].offset > offset) continue;
            if (best === null || best.offset < entry[1].offset) {
                best = entry[1];
            }
        }

        if (best === null) return null;

        return Position.of(best.node, best.offset + offset);
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
