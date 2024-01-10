import { DIContainer } from '../lib/DIContainer';
import { extension } from '../extension/Extension';
import { KeyBindingExtension } from '../keybinding';
import { ClipboardCut } from './ClipboardCut';
import { ClipboardPaste } from './ClipboardPaste';
import { ClipboardCopy } from './ClipboardCopy';
import { ContentEditEventHub } from '../contenteditable/common/ContentEditEventHub';
import { KeyBindingService } from '../keybinding/common/KeyBindingService';
import { CommandService } from '../command/CommandService';

export const ClipboardExtension = extension({
    name: 'Clipboard',
    dependencies: [KeyBindingExtension],
    setup(container: DIContainer) {
        const contentEditEventHub = container.get(ContentEditEventHub.ServiceKey);
        const keybindingService = container.get(KeyBindingService.ServiceKey);
        const commandService = container.get(CommandService.ServiceKey);

        contentEditEventHub
            .on('deleteByCut', () => commandService.exec(ClipboardCut()))
            .on('insertFromPaste', () => commandService.exec(ClipboardPaste()));

        keybindingService
            .registerBinding({ key: 'cmd+x', command: 'clipboard.cut' })
            .registerBinding({ key: 'cmd+c', command: 'clipboard.copy' })
            .registerBinding({ key: 'cmd+v', command: 'clipboard.paste' })
            .registerBinding({ key: 'ctrl+x', command: 'clipboard.cut' })
            .registerBinding({ key: 'ctrl+c', command: 'clipboard.copy' })
            .registerBinding({ key: 'ctrl+v', command: 'clipboard.paste' })
            .registerHandler('clipboard.cut', () => commandService.exec(ClipboardCut()))
            .registerHandler('clipboard.copy', () => commandService.exec(ClipboardCopy()))
            .registerHandler('clipboard.paste', () => commandService.exec(ClipboardPaste()));
    },
});
