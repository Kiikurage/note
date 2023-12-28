import { Logger } from '../lib/logger';
import { Editor } from '../core/Editor';
import { addListener, Disposable } from '../lib';
import { EditorState } from '../core/EditorState';
import { getCommandService } from '../core/CommandService';

export class InputReceiver extends Disposable {
    readonly textarea: HTMLTextAreaElement;

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

        const commandService = getCommandService();
        commandService.registerCommandHandler('editor.action.clipboardCopyAction', () => {
            const text = editor.state.cursors
                .map((cursor) => editor.state.value.substring(cursor.from, cursor.to))
                .join('');

            navigator.clipboard.writeText(text);
        });
        commandService.registerCommandHandler('editor.action.clipboardCutAction', () => {
            const text = editor.state.cursors
                .map((cursor) => editor.state.value.substring(cursor.from, cursor.to))
                .join('');

            navigator.clipboard.writeText(text);
            editor.removeSelectedRanges();
        });
        commandService.registerCommandHandler('editor.action.clipboardPasteAction', async () => {
            const text = await navigator.clipboard.readText();
            editor.insertText(text);
        });
    }

    dispose() {
        getCommandService()
            .unregisterCommandHandler('editor.action.clipboardCopyAction')
            .unregisterCommandHandler('editor.action.clipboardCutAction')
            .unregisterCommandHandler('editor.action.clipboardPasteAction');

        super.dispose();
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
        this.editor.startComposition();
    };

    private readonly handleTextAreaCompositionEnd = () => {
        this.editor.endComposition();
        this.textarea.value = '';
    };

    private readonly handleTextAreaInput = (ev: Event) => {
        const inputEvent = ev as InputEvent;

        // List of well-known inputTypes: https://www.w3.org/TR/input-events-1/#interface-InputEvent-Attributes
        switch (inputEvent.inputType) {
            case 'insertText':
                this.editor.insertText(inputEvent.data ?? '');
                this.textarea.value = '';
                break;

            case 'insertLineBreak':
                this.editor.insertText('\n');
                this.textarea.value = '';
                break;

            case 'insertCompositionText':
                this.editor.updateCompositionText(
                    inputEvent.data ?? '',
                    this.textarea.selectionStart,
                    this.textarea.selectionEnd,
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
        textarea.style.width = '1px';

        return textarea;
    }
}

const logger = new Logger(InputReceiver.name);
