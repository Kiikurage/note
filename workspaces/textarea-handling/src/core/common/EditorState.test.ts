import { deleteContentBackward } from './mutation/deleteContentBackward';
import { createEditorState, EditorState } from './EditorState';
import { deleteContentForward } from './mutation/deleteContentForward';
import { insertParagraph } from './mutation/insertParagraph';
import { insertText } from './mutation/insertText';
import { setCursor } from './mutation/setCursor';
import { DocNode, resetNodeIdCounter } from './node/DocNode';
import { createCursor, Cursor } from './Cursor';

describe('EditorState', () => {
    describe('RandomizedTest', () => {
        beforeEach(() => {
            resetNodeIdCounter();
        });

        it('generate randomized test', () => {
            const NUM_ACTIONS_IN_TESTCASE = 100;
            const NUM_TESTCASES = 10000;

            for (let i = 0; i < NUM_TESTCASES; i++) {
                resetNodeIdCounter();
                const actions: Action[] = [];

                try {
                    let state = createEditorState();

                    for (let i = 0; i < NUM_ACTIONS_IN_TESTCASE; i++) {
                        const action = generateAction(state);
                        actions.push(action);
                        state = processAction(state, action);
                    }
                } catch (e) {
                    console.error({ [Date.now()]: actions });
                    console.error(e);
                    throw new Error('Failure scenario found');
                }
            }
        });
    });
});

type Action =
    | { type: 'deleteContentBackward' }
    | { type: 'deleteContentForward' }
    | { type: 'insertParagraph' }
    | { type: 'insertText'; text: string }
    | { type: 'setCursor'; cursor: string };

function getAllNodes(node: DocNode): DocNode[] {
    const nodes = [node];
    for (const child of node.children) {
        nodes.push(...getAllNodes(child));
    }
    return nodes;
}

function findNodeById(root: DocNode, id: number): DocNode | undefined {
    return getAllNodes(root).find((node) => node.id === id);
}

function parseCursorString(root: DocNode, cursorString: string): Cursor {
    const match = cursorString.match(/Cursor\((\d+)\/(\d+), (\d+)\/(\d+)\)/);
    if (!match) throw new Error('Invalid cursor string');
    const anchorNode = findNodeById(root, Number(match[1]));
    const anchorOffset = Number(match[2]);
    const focusNode = findNodeById(root, Number(match[3]));
    const focusOffset = Number(match[4]);
    if (!anchorNode || !focusNode) throw new Error('Node not found');
    return createCursor(anchorNode, anchorOffset, focusNode, focusOffset);
}

function processAction(state: EditorState, action: Action) {
    switch (action.type) {
        case 'deleteContentBackward':
            return deleteContentBackward(state);
        case 'deleteContentForward':
            return deleteContentForward(state);
        case 'insertParagraph':
            return insertParagraph(state);
        case 'insertText':
            return insertText(state, action.text);
        case 'setCursor':
            return setCursor(state, parseCursorString(state.root, action.cursor));
    }
}

function generateAction(state: EditorState): Action {
    switch (Math.floor(Math.random() * 5)) {
        case 0:
            return { type: 'deleteContentBackward' };

        case 1:
            return { type: 'deleteContentForward' };

        case 2:
            return { type: 'insertParagraph' };

        case 3: {
            const text = Math.random().toString(36).substring(7);
            return { type: 'insertText', text };
        }

        case 4: {
            const nodes = getAllNodes(state.root);
            const node1 = nodes[Math.floor(Math.random() * nodes.length)];
            const offset1 = Math.floor(Math.random() * node1.length);
            const node2 = nodes[Math.floor(Math.random() * nodes.length)];
            const offset2 = Math.floor(Math.random() * node2.length);
            const cursor = createCursor(node1, offset1, node2, offset2);
            return { type: 'setCursor', cursor: cursor.toString() };
        }

        default:
            throw 'Unreachable';
    }
}

function execRandomizedTest(actions: Action[]) {
    let state = createEditorState();
    for (const action of actions) {
        state = processAction(state, action);
    }
}
