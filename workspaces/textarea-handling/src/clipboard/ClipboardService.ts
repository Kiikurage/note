import { DIContainer } from '../lib/DIContainer';
import { Editor } from '../core/Editor';
import { Node } from '../core/interfaces';

export class ClipboardService {
    static readonly ServiceKey = DIContainer.register(
        (container) => new ClipboardService(container.get(Editor.ServiceKey)),
    );

    private data: Node[] = [];

    constructor(private readonly editor: Editor) {}

    copy() {
        // this.data = getSelectedData(this.editor.state);
    }

    cut() {
        // this.data = getSelectedData(this.editor.state);
        this.editor.updateState((state) => {
            // return deleteSelectedRange(state);
            return state;
        });
    }

    paste() {
        this.editor.updateState((state) => {
            // state = deleteSelectedRange(state);

            // state = insertNodes(state, this.data);

            return state;
        });
    }
}

// function getSelectedData(state: EditorState) {
//     if (state.cursor.collapsed) return [];
//
//     if (state.cursor.focus.path.equals(state.cursor.anchor.path)) {
//         const node = state.root.getByPath(state.cursor.focus.path);
//         assert(node !== null, 'node must not be null');
//
//         const [leftAndMid, right] = node.split(state.cursor.focus.offset);
//         assert(leftAndMid !== null, 'leftAndMid must not be null');
//
//         const [left, mid] = leftAndMid.split(state.cursor.anchor.offset);
//         assert(mid !== null, 'mid must not be null');
//
//         return [mid];
//     }
//     const { leftCoveredPath, fullyCoveredPaths, rightCoveredPath } = state.root.computeCoveredNodes(
//         state.cursor.anchor,
//         state.cursor.focus,
//     );
//
//     const data = fullyCoveredPaths.map((path) => state.root.getByPath(path)).filter(isNotNullish);
//
//     if (leftCoveredPath) {
//         const leftNode = state.root.getByPath(leftCoveredPath);
//         if (leftNode) {
//             const splitResult = leftNode.split(state.cursor.anchor.offset);
//             if (splitResult[1]) data.unshift(splitResult[1]);
//         }
//     }
//
//     if (rightCoveredPath) {
//         const rightNode = state.root.getByPath(rightCoveredPath);
//         if (rightNode) {
//             const splitResult = rightNode.split(state.cursor.anchor.offset);
//             if (splitResult[0]) data.push(splitResult[0]);
//         }
//     }
//
//     return data;
// }
//
// function insertNodes(state: EditorState, nodes: Node[]) {
//     if (!state.cursor.collapsed) state = deleteSelectedRange(state);
//     assert(state.cursor.collapsed, 'cursor must be collapsed after deleting selected range');
//
//     const caret = state.cursor.focus;
//     const node = state.root.getByPath(caret.path);
//     assert(node !== null, 'node must not be null');
//
//     const [left, right] = node.split(caret.offset);
//
//     const parentPath = caret.path.parent();
//     const parent = state.root.getByPath(parentPath);
//     assert(parent !== null, 'parent must not be null');
//
//     const offset = parent.children.indexOf(node);
//     assert(offset !== -1, 'offset must not be -1');
//
//     nodes = [left, ...nodes, right].filter(isNotNullish);
//     if (nodes.length >= 2) nodes.splice(0, 2, ...nodes[0].join(nodes[1]).filter(isNotNullish));
//     if (nodes.length >= 2)
//         nodes.splice(0, 2, ...nodes[nodes.length - 2].join(nodes[nodes.length - 1]).filter(isNotNullish));
//
//     const lastNode = nodes[nodes.length - 1];
//     return state.copy({
//         root: state.root.spliceByPosition(Position.of(parentPath, offset), 1, ...nodes),
//         cursor: Cursor.of(parentPath.child(lastNode.id), lastNode.length - (right?.length ?? 0)),
//     });
// }
