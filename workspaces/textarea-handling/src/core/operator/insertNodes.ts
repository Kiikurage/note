import { DocNode } from '../node/DocNode';
import { EditorState } from '../EditorState';
import { createPoint, Point } from '../Point';
import { deleteSelectedRange } from './deleteSelectedRange';
import { collapsed, createCursor } from '../Cursor';
import { assert } from '../../lib/assert';
import { ParagraphNode } from '../node/ContainerNode';

/**
 * Insert nodes intelligently at the selected position, with splitting the insert point
 * and merging with surrounding contents, and update cursor position.
 */
export function insertNodes(state: EditorState, nodes: readonly DocNode[]): EditorState {
    if (!collapsed(state.cursor)) state = deleteSelectedRange(state);

    const { insertedRangeTo } = insertNodesAtPoint(state.cursor.focus, nodes);
    return { ...state, cursor: createCursor(insertedRangeTo) };
}

/**
 * Insert nodes intelligently at the selected position, with splitting the insert point
 * and merging with surrounding contents, and returns the end point of inserted contents.
 */
export function insertNodesAtPoint(point: Point, insertNodes: readonly DocNode[]): InsertNodesResult {
    if (insertNodes.length === 0)
        return {
            insertedRangeFrom: point,
            insertedRangeTo: point,
        };

    const insertInline = !point.node.isBlock() && insertNodes.every((node) => node.isInline());

    insertNodes = insertNodes.map((node) => node.cloneTree());

    if (!insertInline) {
        // Wrap nodes by paragraph to ensure all insert nodes are block nodes
        // TODO: Adjacent inline nodes, must be wrapped by a single paragraph
        insertNodes = insertNodes.map((node) => {
            if (node.isInline()) {
                const block = new ParagraphNode();
                block.insertLast(node);
                return block;
            } else {
                return node;
            }
        });

        // For block-level insertion, insert point must be block node
        while (!point.node.isBlock()) {
            point = point.node.splitNode(point.offset);
        }
    }

    // If insert point is middle of non-root node, split that node, and after insertion, merge nodes if necessary.
    let shouldMergeWithPrev = false;
    let shouldMergeWithNext = false;
    if (point.node.parent !== null) {
        shouldMergeWithPrev = point.offset > 0;
        shouldMergeWithNext = point.offset < point.node.length;

        if (point.node.length === 0) {
            // When the node is empty, splitNode returns the beginning of that node without any splitting.
            // We should merge inserted nodes with this empty node, which are at the next of the inserted nodes.
            shouldMergeWithNext = true;
        }

        point = point.node.splitNode(point.offset);
    }

    for (const insertNode of insertNodes) {
        point.node.insertChild(point.offset, insertNode);
        point.offset += 1;
    }

    let insertedRangeFrom = createPoint(insertNodes[0], 0);
    let insertedRangeTo = createPoint(insertNodes[insertNodes.length - 1], insertNodes[insertNodes.length - 1].length);

    if (shouldMergeWithPrev) {
        const nodeBeforeInsertion = insertedRangeFrom.node.prev;
        assert(nodeBeforeInsertion !== null, 'Node before insertion should not be null');

        const nodeAfterInsertion = insertedRangeTo.node.next;

        insertedRangeFrom = nodeBeforeInsertion.mergeWithNext().point;

        const newLastInsertedNode =
            nodeAfterInsertion === null ? point.node.children[point.node.length - 1] : nodeAfterInsertion.prev;
        assert(newLastInsertedNode !== null, 'New last inserted node should not be null');

        insertedRangeTo = createPoint(newLastInsertedNode, newLastInsertedNode.length);
    }
    if (shouldMergeWithNext) {
        insertedRangeTo = insertedRangeTo.node.mergeWithNext().point;
    }

    return {
        insertedRangeFrom,
        insertedRangeTo,
    };
}

export interface InsertNodesResult {
    insertedRangeFrom: Point;
    insertedRangeTo: Point;
}
