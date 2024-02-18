import { TextNode } from '../core/node/TextNode';
import { insertText } from '../core/operator/insertText';
import { createCursor, Cursor } from '../core/Cursor';
import { Editor, defineComponent } from '../core/Editor';
import { InsertText } from '../core/command/InsertText';
import { CommandService } from '../core/CommandService';
import { SetCursor } from '../core/command/SetCursor';
import { PointMap } from './PointMap';
import { InsertParagraph } from '../core/command/InsertParagraph';
import { DeleteContentBackward } from '../core/command/DeleteContentBackward';
import { DeleteContentForward } from '../core/command/DeleteContentForward';
import { DeleteSoftLineBackward } from '../core/command/DeleteSoftLineBackward';
import { DeleteSoftLineForward } from '../core/command/DeleteSoftLineForward';
import { ClipboardCut } from '../core/command/ClipboardCut';
import { ClipboardPaste } from '../core/command/ClipboardPaste';
import { ClipboardCopy } from '../core/command/ClipboardCopy';

export class DOMEventHandlerManager {
    static readonly ComponentKey = defineComponent(
        (editor) =>
            new DOMEventHandlerManager(
                editor,
                editor.getComponent(CommandService.ComponentKey),
                editor.getComponent(PointMap.ComponentKey),
            ),
    );

    private readonly handlers = new Map<ContentEditType, ContentEditEventHandler>();
    private composing = false;

    constructor(
        private readonly editor: Editor,
        private readonly commandService: CommandService,
        private readonly pointMap: PointMap,
    ) {
        this.addContentEditEventHandler('insertText', (data) => commandService.exec(InsertText({ text: data ?? '' })))
            .addContentEditEventHandler('insertParagraph', () => commandService.exec(InsertParagraph()))
            .addContentEditEventHandler('deleteContentBackward', () => commandService.exec(DeleteContentBackward()))
            .addContentEditEventHandler('deleteContentForward', () => commandService.exec(DeleteContentForward()))
            .addContentEditEventHandler('deleteSoftLineBackward', () => commandService.exec(DeleteSoftLineBackward()))
            .addContentEditEventHandler('deleteSoftLineForward', () => commandService.exec(DeleteSoftLineForward()));
    }

    get isComposing(): boolean {
        return this.composing;
    }

    addContentEditEventHandler(type: ContentEditType, handler: ContentEditEventHandler): this {
        this.handlers.set(type, handler);
        return this;
    }

    registerRootElementEventHandlers(rootElement: HTMLElement | null): () => void {
        if (!rootElement) return () => {};

        const ownerDocument = rootElement.ownerDocument;

        rootElement.addEventListener('beforeinput', this.handleBeforeInput);
        rootElement.addEventListener('compositionstart', this.handleCompositionStart);
        rootElement.addEventListener('compositionend', this.handleCompositionEnd);
        rootElement.addEventListener('cut', this.handleCut);
        rootElement.addEventListener('copy', this.handleCopy);
        rootElement.addEventListener('paste', this.handlePaste);
        ownerDocument.addEventListener('selectionchange', this.handleSelectionChange);

        return () => {
            rootElement.removeEventListener('beforeinput', this.handleBeforeInput);
            rootElement.removeEventListener('compositionstart', this.handleCompositionStart);
            rootElement.removeEventListener('compositionend', this.handleCompositionEnd);
            rootElement.removeEventListener('cut', this.handleCut);
            rootElement.removeEventListener('copy', this.handleCopy);
            rootElement.removeEventListener('paste', this.handlePaste);
            ownerDocument.removeEventListener('selectionchange', this.handleSelectionChange);
        };
    }

    private readonly handleBeforeInput = (ev: InputEvent) => {
        if (ev.inputType === 'insertCompositionText') {
            ev.preventDefault();
            return;
        }

        if (!this.handlers.has(ev.inputType)) {
            console.log(ev.inputType);
        }

        this.handlers.get(ev.inputType)?.(ev.data);
        ev.preventDefault();
    };

    private readonly handleCompositionStart = () => {
        if (!(this.editor.state.cursor.anchor.node instanceof TextNode)) {
            this.editor.updateState((state) => {
                // Insert a dummy zero-width space to ensure there is a DOM TextNode
                state = insertText(state, ZERO_WIDTH_SPACE);
                state = { ...state, cursor: createCursor(state.cursor.anchor.node, state.cursor.anchor.offset - 1) };
                return state;
            });
        }
        this.composing = true;
    };

    private readonly handleCompositionEnd = (ev: CompositionEvent) => {
        // Clean up dummy zero-width space
        this.editor.updateState((state) => {
            const node = state.cursor.anchor.node;
            if (!(node instanceof TextNode)) return state;
            if (node.text !== ZERO_WIDTH_SPACE) return state;
            node.text = '';
            return { ...state };
        });
        this.composing = false;
        this.commandService.exec(InsertText({ text: ev.data ?? '' }));
    };

    private readonly handleCut = (ev: ClipboardEvent) => {
        this.commandService.exec(ClipboardCut());
    };

    private readonly handleCopy = (ev: ClipboardEvent) => {
        this.commandService.exec(ClipboardCopy());
    };

    private readonly handlePaste = (ev: ClipboardEvent) => {
        this.commandService.exec(ClipboardPaste());
    };

    private readonly handleSelectionChange = () => {
        if (this.composing) return;

        const selection = this.pointMap.getSelection();
        if (selection === null) return;

        this.commandService.exec(SetCursor({ cursor: createCursor(selection.anchor, selection.focus) }));
    };
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

export type ContentEditEventHandler = (data: string | null) => void;

const ZERO_WIDTH_SPACE = '\u200B';
