import { Doc } from '../Doc';
import { Position } from '../Position';
import { TextNode } from '../node/TextNode';

export function prevPosition(doc: Doc, position: Position): Position | null {
    const child = doc.getByPositionOrNull(position);
    if (child !== null) {
        if (child instanceof TextNode) {
            return Position.of(child.id, child.length);
        }

        const childIds = doc.childIds(child.id);
        return Position.of(child.id, childIds.length);
    }

    const node = doc.get(position.nodeId);
    if (node instanceof TextNode && position.offset > 0) {
        return Position.of(position.nodeId, position.offset - 1);
    }
    if (position.offset > 0) {
        return Position.of(position.nodeId, position.offset - 1);
    }

    const parentId = doc.parentIdOrNull(position.nodeId);
    if (parentId === null) return null;

    return doc.getPositionOrNull(parentId);
}
