import { DocNode, resetNodeIdCounter } from './node/DocNode';
import { createCursor } from './Cursor';
import { Editor } from './Editor';
import { CommandService } from './CommandService';
import { DeleteContentBackward } from './command/DeleteContentBackward';
import { DeleteContentForward } from './command/DeleteContentForward';
import { InsertParagraph } from './command/InsertParagraph';
import { InsertText } from './command/InsertText';
import { ClipboardCut } from './command/ClipboardCut';
import { ClipboardPaste } from './command/ClipboardPaste';
import { ClipboardCopy } from './command/ClipboardCopy';
import { SetCursor } from './command/SetCursor';
import { ICommand } from './Command';
import { dumpEditorState } from './EditorState';

describe('EditorState', () => {
    describe('RandomizedTest', () => {
        const NUM_TESTCASES = 10000;
        const NUM_ACTIONS_IN_TESTCASE = 100;

        beforeEach(() => {
            resetNodeIdCounter();
        });

        for (let i = 0; i < NUM_TESTCASES; i++) {
            it(`generate randomized test ${i}`, () => {
                const editor = new Editor();
                const commandService = editor.getComponent(CommandService.ComponentKey);
                const commands: ICommand[] = [];

                return expect(
                    (async () => {
                        for (let i = 0; i < NUM_ACTIONS_IN_TESTCASE; i++) {
                            const command = generateCommand(editor);
                            commands.push(command);

                            try {
                                await commandService.exec(command);
                            } catch (e) {
                                console.dir(dumpEditorState(editor.state), { depth: null });
                                console.dir({ [Date.now()]: commands }, { depth: null });
                                throw new Error('Fatal scenario found', e as Error);
                            }
                        }
                    })(),
                ).resolves.toBeUndefined();
            });
        }

        it('1708277305698', async () => {
            const editor = new Editor();
            const commandService = editor.getComponent(CommandService.ComponentKey);

            await commandService.exec(InsertText({ text: 'tr6fb8' }));
            await commandService.exec(ClipboardPaste());
            await commandService.exec(ClipboardCut());
            await commandService.exec(DeleteContentBackward());
            await commandService.exec(
                SetCursor({
                    cursor: createCursor(editor.state.root.children[0].children[0], 2, 1),
                }),
            );
            await commandService.exec(ClipboardCut());
            await commandService.exec(InsertParagraph());
            await commandService.exec(ClipboardPaste());
            await commandService.exec(ClipboardCopy());
            console.dir(dumpEditorState(editor.state), { depth: null });
            await commandService.exec(ClipboardPaste());
        });
    });
});

function getAllNodes(node: DocNode): DocNode[] {
    const nodes = [node];
    for (const child of node.children) {
        nodes.push(...getAllNodes(child));
    }
    return nodes;
}

function generateCommand(editor: Editor): ICommand {
    const commandFactories: (() => ICommand)[] = [
        () => DeleteContentBackward(),
        () => DeleteContentForward(),
        () => InsertParagraph(),
        () => InsertText({ text: Math.random().toString(36).substring(7) }),
        () => {
            const nodes = getAllNodes(editor.state.root);
            const node1 = nodes[Math.floor(Math.random() * nodes.length)];
            const offset1 = Math.floor(Math.random() * node1.length);
            const node2 = nodes[Math.floor(Math.random() * nodes.length)];
            const offset2 = Math.floor(Math.random() * node2.length);
            const cursor = createCursor(node1, offset1, node2, offset2);

            return SetCursor({ cursor });
        },
        () => ClipboardCut(),
        () => ClipboardCopy(),
        () => ClipboardPaste(),
    ];

    return commandFactories[Math.floor(Math.random() * commandFactories.length)]();
}
