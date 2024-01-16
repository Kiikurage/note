import { DIContainer } from '../lib/DIContainer';
import { extension } from '../extension/Extension';
import { ContentEditEventHub } from './common/ContentEditEventHub';
import { CommandService } from '../command/CommandService';
import { InsertText } from './common/command/InsertText';
import { InsertParagraph } from './common/command/InsertParagraph';
import { DeleteContentBackward } from './common/command/DeleteContentBackward';
import { DeleteContentForward } from './common/command/DeleteContentForward';
import { ReactComponentTypeMap } from './ReactComponentTypeMap';
import { TextNodeView } from './nodeView/TextNodeView';
import { TextNode } from '../core/node/TextNode';
import { ParagraphNodeView } from './nodeView/ParagraphNodeView';
import { RootNode } from '../core/node/RootNode';
import { RootNodeView } from './nodeView/RootNodeView';
import { ParagraphNode } from '../core/node/ContainerNode';
import { DeleteSoftLineBackward } from './common/command/DeleteSoftLineBackward';
import { DeleteSoftLineForward } from './common/command/DeleteSoftLineForward';

export const ContentEditableExtension = extension({
    name: 'ContentEditable',
    dependencies: [],
    setup(container: DIContainer) {
        const contentEditEventHub = container.get(ContentEditEventHub.ServiceKey);
        const commandService = container.get(CommandService.ServiceKey);
        const componentTypeMap = container.get(ReactComponentTypeMap.ServiceKey);

        contentEditEventHub
            .on('insertText', (data) => commandService.exec(InsertText({ text: data ?? '' })))
            .on('insertParagraph', () => commandService.exec(InsertParagraph()))
            .on('deleteContentBackward', () => commandService.exec(DeleteContentBackward()))
            .on('deleteContentForward', () => commandService.exec(DeleteContentForward()))
            .on('deleteSoftLineBackward', () => commandService.exec(DeleteSoftLineBackward()))
            .on('deleteSoftLineForward', () => commandService.exec(DeleteSoftLineForward()));

        componentTypeMap
            .register(TextNode, TextNodeView)
            .register(ParagraphNode, ParagraphNodeView)
            .register(RootNode, RootNodeView);
    },
});
