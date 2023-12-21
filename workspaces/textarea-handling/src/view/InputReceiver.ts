import { Channel, Disposable, eventTarget } from '../lib';
import { Logger } from '../lib/logger';
import { dom } from '../lib/dom';

interface InputReceiverKeyboardEvent {
    key: string;
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    preventDefault(): void;
}

export class InputReceiver extends Disposable {
    readonly onFocus = this.register(new Channel());
    readonly onBlur = this.register(new Channel());
    readonly onActivate = this.register(new Channel());
    readonly onDeactivate = this.register(new Channel());
    readonly onInsert = this.register(new Channel<string>());
    readonly onCompositionChange = this.register(new Channel<string>());
    readonly onCompositionEnd = this.register(new Channel<string>());
    readonly onKeyDown = this.register(new Channel<InputReceiverKeyboardEvent>());
    readonly onKeyUp = this.register(new Channel<InputReceiverKeyboardEvent>());

    private readonly textarea: HTMLTextAreaElement;
    private active: boolean;
    private rootHasFocus: boolean;

    constructor() {
        super();

        this.textarea = createTextArea(document);
        this.register(
            dom(this.textarea)
                .addListener('keydown', this.handleTextAreaKeyDown)
                .addListener('keyup', this.handleTextAreaKeyUp)
                .addListener('focus', this.handleTextAreaFocus)
                .addListener('blur', this.handleTextAreaBlur)
                .addListener('compositionend', this.handleTextAreaCompositionEnd)
                .addListener('input', this.handleTextAreaInput),
        );

        this.register(
            eventTarget(window).addListener('focus', this.handleWindowFocus).addListener('blur', this.handleWindowBlur),
        );

        this.active = this.textarea.ownerDocument.activeElement === this.textarea;
        this.rootHasFocus = this.textarea.ownerDocument.hasFocus();
    }

    focus() {
        this.textarea?.focus();
    }

    blur() {
        this.textarea?.blur();
    }

    get isActive() {
        return this.active;
    }

    get isFocused() {
        return this.active && this.rootHasFocus;
    }

    private updateFocusState() {
        const oldStatus = { active: this.isActive, focused: this.isFocused };

        this.active = this.textarea.ownerDocument.activeElement === this.textarea;
        this.rootHasFocus = this.textarea.ownerDocument.hasFocus();

        const newStatus = { active: this.isActive, focused: this.isFocused };

        if (!oldStatus.active && newStatus.active) {
            this.onActivate.fire();
        }
        if (!oldStatus.focused && newStatus.focused) {
            this.onFocus.fire();
        }
        if (oldStatus.focused && !newStatus.focused) {
            this.onBlur.fire();
        }
        if (oldStatus.active && !newStatus.active) {
            this.onDeactivate.fire();
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

    private readonly handleTextAreaCompositionEnd = (ev: CompositionEvent) => {
        this.onCompositionEnd.fire(ev.data ?? '');
        this.textarea.value = '';
    };

    private readonly handleTextAreaInput = (ev: Event) => {
        const inputEvent = ev as InputEvent;

        // List of well-known inputTypes: https://www.w3.org/TR/input-events-1/#interface-InputEvent-Attributes
        switch (inputEvent.inputType) {
            case 'insertText':
            case 'insertLineBreak':
                this.onInsert.fire(this.textarea.value);
                this.textarea.value = '';
                break;

            case 'insertCompositionText':
                this.onCompositionChange.fire(inputEvent.data ?? '');
                break;

            // Overridden by application
            case 'historyUndo':
            case 'historyRedo':
            case 'insertFromPaste':
                ev.preventDefault();
                this.textarea.value = '';
                break;

            case 'deleteContentForward':
            case 'deleteContentBackward':
            case 'deleteByCut':
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

    private readonly handleTextAreaKeyDown = (ev: KeyboardEvent) => {
        this.onKeyDown.fire(ev);
    };

    private readonly handleTextAreaKeyUp = (ev: KeyboardEvent) => {
        this.onKeyUp.fire(ev);
    };
}

const logger = new Logger(InputReceiver.name);

function createTextArea(document: Document) {
    const textarea = document.createElement('textarea');

    textarea.style.pointerEvents = 'none';
    textarea.style.width = '0';
    textarea.style.height = '0';
    textarea.style.border = 'none';
    textarea.style.padding = '0';
    textarea.style.margin = '0';

    document.body.appendChild(textarea);

    return textarea;
}
