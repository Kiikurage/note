import { DIContainer } from '../../core/common/DIContainer';
import { InsertText } from './command/InsertText';
import { InsertLineBreak } from './command/InsertLineBreak';
import { InsertParagraph } from './command/InsertParagraph';
import { DeleteContentBackward } from './command/DeleteContentBackward';
import { DeleteContentForward } from './command/DeleteContentForward';
import { DeleteSoftLineBackward } from './command/DeleteSoftLineBackward';
import { DeleteSoftLineForward } from './command/DeleteSoftLineForward';
import { DeleteHardLineBackward } from './command/DeleteHardLineBackward';
import { CommandService } from '../../core/common/CommandService';
import { Disposable } from '../../lib';
import { Logger } from '../../lib/logger';

export class ContentEditEventHub extends Disposable {
    static readonly ServiceKey = DIContainer.register(
        (container) => new ContentEditEventHub(container.get(CommandService.ServiceKey)),
    );

    private readonly handlers = new Map<ContentEditType, ContentEditHandler>();
    private readonly logger = new Logger(ContentEditEventHub.name);

    constructor(private readonly commandService: CommandService) {
        super();

        // Basic commands
        this.on('insertText', (data) => {
            commandService.exec(InsertText({ text: data ?? '' }));
        })
            .on('insertLineBreak', () => {
                commandService.exec(InsertLineBreak());
            })
            .on('insertParagraph', () => {
                commandService.exec(InsertParagraph());
            })
            .on('deleteContentBackward', () => {
                commandService.exec(DeleteContentBackward());
            })
            .on('deleteContentForward', () => {
                commandService.exec(DeleteContentForward());
            })
            .on('deleteSoftLineBackward', () => {
                commandService.exec(DeleteSoftLineBackward());
            })
            .on('deleteSoftLineForward', () => {
                commandService.exec(DeleteSoftLineForward());
            })
            .on('deleteHardLineBackward', () => {
                commandService.exec(DeleteHardLineBackward());
            })
            .on('deleteHardLineForward', () => {
                commandService.exec(DeleteHardLineBackward());
            });
    }

    dispose() {
        this.handlers.clear();
        super.dispose();
    }

    on(type: ContentEditType, handler: ContentEditHandler): this {
        this.handlers.set(type, handler);
        return this;
    }

    fire(type: ContentEditType, data: string | null) {
        this.handlers.get(type)?.(data);
    }
}

// List of well-known inputTypes: https://www.w3.org/TR/input-events-1/#interface-InputEvent-Attributes
export type ContentEditType =
    | 'insertText'
    | 'insertLineBreak'
    | 'insertCompositionText'
    | 'historyUndo'
    | 'historyRedo'
    | 'insertFromPaste'
    | 'deleteByCut'
    | 'deleteContentForward'
    | 'deleteContentBackward'
    | 'insertReplacementText'
    | 'insertParagraph'
    | 'insertOrderedList'
    | 'insertUnorderedList'
    | 'insertHorizontalRule'
    | 'insertFromYank'
    | 'insertFromDrop'
    | 'insertFromPasteAsQuotation'
    | 'insertTranspose'
    | 'insertLink'
    | 'deleteWordBackward'
    | 'deleteWordForward'
    | 'deleteSoftLineBackward'
    | 'deleteSoftLineForward'
    | 'deleteEntireSoftLine'
    | 'deleteHardLineBackward'
    | 'deleteHardLineForward'
    | 'deleteByDrag'
    | 'deleteContent'
    | 'formatBold'
    | 'formatItalic'
    | 'formatUnderline'
    | 'formatStrikeThrough'
    | 'formatSuperscript'
    | 'formatSubscript'
    | 'formatJustifyFull'
    | 'formatJustifyCenter'
    | 'formatJustifyRight'
    | 'formatJustifyLeft'
    | 'formatIndent'
    | 'formatOutdent'
    | 'formatRemove'
    | 'formatSetBlockTextDirection'
    | 'formatSetInlineTextDirection'
    | 'formatBackColor'
    | 'formatFontColor'
    | 'formatFontName'
    | string;

export type ContentEditHandler = (data: string | null) => void;
