import { Logger } from '../lib/logger';
import { Editor } from '../core/Editor';
import { addListener, Disposable } from '../lib';
import { EditorState } from '../core/EditorState';

export class InputReceiver extends Disposable {
    readonly textarea: HTMLTextAreaElement;
    private compositionStartOffset: number = 0;

    constructor(readonly editor: Editor) {
        super();

        this.register(editor.onChange.addListener((state) => this.syncStateToDOM(state)));
        this.register(addListener(window, 'focus', this.handleWindowFocus));
        this.register(addListener(window, 'blur', this.handleWindowBlur));

        this.textarea = InputReceiver.createTextElement(document);
        this.register(addListener(this.textarea, 'focus', this.handleTextAreaFocus));
        this.register(addListener(this.textarea, 'blur', this.handleTextAreaBlur));
        this.register(addListener(this.textarea, 'compositionstart', this.handleTextAreaCompositionStart));
        this.register(addListener(this.textarea, 'compositionend', this.handleTextAreaCompositionEnd));
        this.register(addListener(this.textarea, 'input', this.handleTextAreaInput));
    }

    get active() {
        return this.textarea.ownerDocument.activeElement === this.textarea;
    }

    get rootFocused() {
        return this.textarea.ownerDocument.hasFocus();
    }

    private updateFocusState() {
        this.editor.setFocusState({ active: this.active, rootFocused: this.rootFocused });
    }

    private syncStateToDOM(state: EditorState) {
        if (state.active && !this.active) {
            this.textarea.focus();
        }
        if (!state.active && this.active) {
            this.textarea.blur();
        }

        // Updating textarea value/selection will abort the composition session
        if (!state.inComposition) {
            this.textarea.value = state.value;

            const cursor = state.cursors[0];
            if (cursor !== undefined) {
                this.textarea.selectionStart = cursor.from;
                this.textarea.selectionEnd = cursor.to;
                this.textarea.selectionDirection = cursor.direction;
            }
        }
    }

    private readonly handleWindowFocus = () => {
        this.updateFocusState();
    };

    private readonly handleWindowBlur = () => {
        this.updateFocusState();
    };

    private readonly handleTextAreaFocus = () => {
        this.updateFocusState();
    };

    private readonly handleTextAreaBlur = () => {
        this.updateFocusState();
    };

    private readonly handleTextAreaCompositionStart = () => {
        this.compositionStartOffset = this.textarea.selectionStart;
        this.editor.startComposition();
    };

    private readonly handleTextAreaCompositionEnd = () => {
        this.compositionStartOffset = 0;
        this.editor.endComposition();
    };

    private readonly handleTextAreaInput = (ev: Event) => {
        const inputEvent = ev as InputEvent;

        // List of well-known inputTypes: https://www.w3.org/TR/input-events-1/#interface-InputEvent-Attributes
        switch (inputEvent.inputType) {
            case 'insertText':
                this.editor.insertText(inputEvent.data ?? '');
                break;

            case 'insertLineBreak':
                this.editor.insertText('\n');
                break;

            case 'insertCompositionText':
                this.editor.updateCompositionText(
                    inputEvent.data ?? '',
                    this.textarea.selectionStart - this.compositionStartOffset,
                    this.textarea.selectionEnd - this.compositionStartOffset,
                );
                break;

            // Overridden by application
            case 'historyUndo':
            case 'historyRedo':
            case 'insertFromPaste':
            case 'deleteByCut':
                inputEvent.preventDefault();
                break;

            case 'deleteContentForward':
            case 'deleteContentBackward':
            case 'insertReplacementText':
            case 'insertParagraph':
            case 'insertOrderedList':
            case 'insertUnorderedList':
            case 'insertHorizontalRule':
            case 'insertFromYank':
            case 'insertFromDrop':
            case 'insertFromPasteAsQuotation':
            case 'insertTranspose':
            case 'insertLink':
            case 'deleteWordBackward':
            case 'deleteWordForward':
            case 'deleteSoftLineBackward':
            case 'deleteSoftLineForward':
            case 'deleteEntireSoftLine':
            case 'deleteHardLineBackward':
            case 'deleteHardLineForward':
            case 'deleteByDrag':
            case 'deleteContent':
            case 'formatBold':
            case 'formatItalic':
            case 'formatUnderline':
            case 'formatStrikeThrough':
            case 'formatSuperscript':
            case 'formatSubscript':
            case 'formatJustifyFull':
            case 'formatJustifyCenter':
            case 'formatJustifyRight':
            case 'formatJustifyLeft':
            case 'formatIndent':
            case 'formatOutdent':
            case 'formatRemove':
            case 'formatSetBlockTextDirection':
            case 'formatSetInlineTextDirection':
            case 'formatBackColor':
            case 'formatFontColor':
            case 'formatFontName':
            default:
                logger.warn(`Unsupported input type: ${inputEvent.inputType}`);
        }
    };
    private static createTextElement(document: Document) {
        const textarea = document.createElement('textarea');
        textarea.style.padding = '0';
        textarea.style.margin = '0';
        textarea.style.border = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.overflow = 'hidden';
        textarea.style.position = 'absolute';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.height = '1em';
        textarea.style.width = '1px';

        return textarea;
    }
}

const logger = new Logger(InputReceiver.name);
