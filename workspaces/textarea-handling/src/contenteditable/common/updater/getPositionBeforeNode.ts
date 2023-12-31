import { assert } from '../../../lib';
import { Node } from '../../../core/common/Node';
import { Path } from '../../../core/common/Path';
import { Position } from '../../../core/common/Position';

export function getPositionBeforeNode(root: Node, nodePath: Path): Position {
    const node = root.getByPath(nodePath);
    assert(node !== null, 'node !== null');

    const parentPath = nodePath.parent();
    const parent = root.getByPath(parentPath);
    assert(parent !== null, 'parent !== null');

    const offset = parent.children.indexOf(node);
    assert(offset !== -1, 'offset !== -1');

    return Position.of(parentPath, offset);
}
