import { DIContainer } from '../../core/common/DIContainer';
import { Logger } from '../../lib/logger';
import { Editor } from '../../core/common/Editor';
import { KeyBindingService } from '../../keybinding/common/KeyBindingService';
import { ContentEditEventHub } from '../../contenteditable/common/ContentEditEventHub';
import { CommandService } from '../../core/common/CommandService';
import { ClipboardCut } from '../command/ClipboardCut';
import { ClipboardPaste } from '../command/ClipboardPaste';
import { ClipboardCopy } from '../command/ClipboardCopy';

export class ClipboardService {
    static readonly ServiceKey = DIContainer.register(
        (container) =>
            new ClipboardService(
                container.get(ContentEditEventHub.ServiceKey),
                container.get(KeyBindingService.ServiceKey),
                container.get(CommandService.ServiceKey),
                container.get(Editor.ServiceKey),
            ),
    );

    private readonly logger = new Logger(ClipboardService.name);

    private data: string = '';

    constructor(
        contentEditEventHub: ContentEditEventHub,
        keybindingService: KeyBindingService,
        commandService: CommandService,
        private readonly editor: Editor,
    ) {
        contentEditEventHub
            .on('deleteByCut', () => {
                commandService.exec(ClipboardCut());
            })
            .on('insertFromPaste', () => {
                commandService.exec(ClipboardPaste());
            });

        keybindingService
            .registerBinding({ key: 'cmd+x', command: 'clipboard.cut' })
            .registerBinding({ key: 'cmd+c', command: 'clipboard.copy' })
            .registerBinding({ key: 'cmd+v', command: 'clipboard.paste' })
            .registerBinding({ key: 'ctrl+x', command: 'clipboard.cut' })
            .registerBinding({ key: 'ctrl+c', command: 'clipboard.copy' })
            .registerBinding({ key: 'ctrl+v', command: 'clipboard.paste' })
            .registerHandler('clipboard.cut', () => {
                commandService.exec(ClipboardCut());
            })
            .registerHandler('clipboard.copy', () => {
                commandService.exec(ClipboardCopy());
            })
            .registerHandler('clipboard.paste', () => {
                commandService.exec(ClipboardPaste());
            });
    }

    copy() {
        this.data = this.editor.getSelectedText();
    }

    cut() {
        this.copy();
        this.editor.deleteSelectedRanges();
    }

    paste() {
        this.editor.insertText(this.data);
    }
}
