import { DIContainer } from '../lib/DIContainer';
import { extension } from '../extension/Extension';
import { ContentEditEventHub } from './react/ContentEditEventHub';
import { CommandService } from '../command/CommandService';
import { InsertText } from './common/command/InsertText';
import { InsertParagraph } from './common/command/InsertParagraph';
import { DeleteContentBackward } from './common/command/DeleteContentBackward';
import { DeleteContentForward } from './common/command/DeleteContentForward';
import { ReactComponentTypeMap } from './react/ReactComponentTypeMap';
import { TextNodeView } from './react/view/TextNodeView';
import { TextNode } from './common/node/TextNode';
import { ParagraphNodeView } from './react/view/ParagraphNodeView';
import { RootNode } from './common/node/RootNode';
import { RootNodeView } from './react/view/RootNodeView';
import { DeleteSoftLineBackward } from './common/command/DeleteSoftLineBackward';
import { DeleteSoftLineForward } from './common/command/DeleteSoftLineForward';
import { ParagraphNode } from './common/node/ContainerNode';

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
