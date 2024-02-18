import { DocNode, MergeContentResult } from '../node/DocNode';
import { dumpEditorState, EditorState } from '../EditorState';
import { createPoint, Point } from '../Point';
import { cloneTree } from './cloneTree';
import { deleteSelectedRange } from './deleteSelectedRange';
import { collapsed, createCursor } from '../Cursor';
import { assert } from '../../lib/assert';
import { ParagraphNode } from '../node/ContainerNode';
import { Logger } from '../../lib/logger';

/**
 * Insert nodes at the selected position
 */
export function insertNodes(state: EditorState, nodes: readonly DocNode[]): EditorState;
/**
 * Insert nodes at the given point and returns the end of inserted nodes
 */
export function insertNodes(point: Point, nodes: readonly DocNode[]): Point;
export function insertNodes(...args: unknown[]): unknown {
    if (typeof args[0] === 'object' && args[0] !== null && 'root' in args[0]) {
        const [state, nodes] = args as [EditorState, readonly DocNode[]];
        return insertNodesForEditorState(state, nodes);
    } else {
        const [point, nodes] = args as [Point, DocNode[]];
        return insertNodesAtPoint(point, nodes);
    }
}

function insertNodesForEditorState(state: EditorState, nodes: readonly DocNode[]): EditorState {
    if (!collapsed(state.cursor)) state = deleteSelectedRange(state);

    const point = insertNodesAtPoint(state.cursor.focus, nodes);
    return { ...state, cursor: createCursor(point) };
}

function insertNodesAtPoint(point: Point, insertNodes: readonly DocNode[]): Point {
    if (insertNodes.length === 0) return point;

    const insertInline = !point.node.isBlock() && insertNodes.every((node) => node.isInline());

    insertNodes = insertNodes.map((node) => cloneTree(node));

    if (!insertInline) {
        insertNodes = insertNodes.map((node) => {
            if (node.isInline()) {
                // Ensure all insert nodes are block nodes
                const block = new ParagraphNode();
                block.insertLast(node);
                return block;
            } else {
                return node;
            }
        });

        while (!point.node.isBlock()) {
            point = splitNode(point.node, point.offset);
        }
    }

    // If insert point is middle of the node, split the node. After insertion, merge the nodes if necessary.
    let shouldMergeWithPrev: boolean = false;
    let shouldMergeWithNext: boolean = false;
    if (!(insertInline && point.node.isBlock()) && point.node.parent !== null) {
        shouldMergeWithPrev = point.offset > 0;
        shouldMergeWithNext = point.offset < point.node.length;

        if (point.node.length === 0) {
            // When the node is empty, splitNode returns the beginning of that node.
            // So, we should merge inserted nodes with this empty node, which are at the next of the inserted nodes.
            shouldMergeWithNext = true;
        }

        point = splitNode(point.node, point.offset);
    }

    const nodeBeforeInsertion = point.node.children[point.offset - 1] ?? null;
    const nodeAfterInsertion = point.node.children[point.offset] ?? null;

    for (const insertNode of insertNodes) {
        point.node.insertChild(point.offset, insertNode);
        point.offset += 1;
    }

    let result = createPoint(point.node, point.offset);
    if (shouldMergeWithPrev) {
        assert(nodeBeforeInsertion !== null, 'Node before insertion should not be null');

        const mergeResult = nodeBeforeInsertion.mergeWithNext();
        result = createPoint(mergeResult.mergedPoint.node, mergeResult.mergedPoint.node.length);
    }
    if (shouldMergeWithNext) {
        assert(nodeAfterInsertion?.prev !== null, 'Node after insertion should have a prev node');
        result = nodeAfterInsertion.prev.mergeWithNext().mergedPoint;
    }

    return result;
}

/**
 * Split the node at the given offset and returns the split point
 */
function splitNode(node: DocNode, offset: number): Point {
    const parent = node.parent;
    assert(parent !== null, 'Node must have a parent');
    const offsetWithinParent = parent.children.indexOf(node);

    if (offset === 0) return createPoint(parent, offsetWithinParent);
    if (offset === node.length) return createPoint(parent, offsetWithinParent + 1);

    const clone = cloneTree(node);
    node.insertAfter(clone);

    node.deleteContent(offset, node.length);
    clone.deleteContent(0, offset);

    return createPoint(parent, offsetWithinParent + 1);
}

const logger = new Logger('insertNodes');
