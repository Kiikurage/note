import { Doc } from '../Doc';
import { Position } from '../Position';
import { TextNode } from '../node/TextNode';

export function nextPosition(doc: Doc, position: Position): Position | null {
    const node = doc.getByPositionOrNull(position);
    if (node !== null) return Position.of(node.id, 0);

    let positionOrNull: Position | null = position;
    while (positionOrNull !== null) {
        const node = doc.get(positionOrNull.nodeId);
        if (node instanceof TextNode && positionOrNull.offset < node.length) {
            return Position.of(positionOrNull.nodeId, positionOrNull.offset + 1);
        }

        const childIds = doc.childIds(positionOrNull.nodeId);
        if (positionOrNull.offset < childIds.length) {
            return Position.of(positionOrNull.nodeId, positionOrNull.offset + 1);
        }

        positionOrNull = doc.getPositionOrNull(positionOrNull.nodeId);
    }

    return null;
}
