import { Channel, Disposable } from '../lib';
import { EditorState } from './EditorState';
import { InputReceiver } from '../view/InputReceiver';
import { getCommandService } from './CommandService';

export class Editor extends Disposable {
    readonly onChange = this.register(new Channel<EditorState>());

    #state: EditorState = EditorState.create();
    private readonly inputReceiver = this.register(new InputReceiver());

    constructor(private readonly commandService = getCommandService()) {
        super();

        this.commandService
            .register('editor.action.selectAll', () => this.selectAll())
            .register('deleteLeft', () => this.removeBackward())
            .register('deleteRight', () => this.removeForward())
            .register('cursorLeft', () => this.moveBackward())
            .register('cursorLeftSelect', () => this.moveBackwardWithSelect())
            .register('cursorHome', () => this.moveToLineBegin())
            .register('cursorHomeSelect', () => this.moveToLineBeginWithSelect())
            .register('cursorRight', () => this.moveForward())
            .register('cursorRightSelect', () => this.moveForwardWithSelect())
            .register('cursorEnd', () => this.moveToLineEnd())
            .register('cursorEndSelect', () => this.moveToLineEndWithSelect());

        this.inputReceiver.onInsert.addListener((text) => {
            this.state = this.state.insertText(text);
        });
        this.inputReceiver.onCompositionChange.addListener((text) => {
            this.state = this.state.setCompositionValue(text);
        });
        this.inputReceiver.onCompositionEnd.addListener(() => {
            this.state = this.state.insertText(this.state.compositionValue).setCompositionValue('');
        });
        this.inputReceiver.onFocus.addListener(() => {
            this.state = this.state.copy({ focused: true });
        });
        this.inputReceiver.onBlur.addListener(() => {
            this.state = this.state.copy({ focused: false });
        });
        this.inputReceiver.onActivate.addListener(() => {
            this.state = this.state.copy({ active: true });
        });
        this.inputReceiver.onDeactivate.addListener(() => {
            this.state = this.state.copy({ active: false });
        });
    }

    get state() {
        return this.#state;
    }

    private set state(state: EditorState) {
        this.#state = state;
        this.onChange.fire(state);
    }

    focus() {
        this.inputReceiver.focus();
    }

    blur() {
        this.inputReceiver.blur();
    }

    insertText(text: string) {
        this.state = this.state.insertText(text);
    }

    removeBackward() {
        this.state = this.state.removeBackward();
    }

    removeForward() {
        this.state = this.state.removeForward();
    }

    moveBackward() {
        this.state = this.state.moveBackward();
    }

    moveBackwardWithSelect() {
        this.state = this.state.moveBackwardWithSelect();
    }

    moveToLineBegin() {
        this.state = this.state.moveToLineBegin();
    }

    moveToLineBeginWithSelect() {
        this.state = this.state.moveToLineBeginWithSelect();
    }

    moveForward() {
        this.state = this.state.moveForward();
    }

    moveForwardWithSelect() {
        this.state = this.state.moveForwardWithSelect();
    }

    moveToLineEnd() {
        this.state = this.state.moveToLineEnd();
    }

    moveToLineEndWithSelect() {
        this.state = this.state.moveToLineEndWithSelect();
    }

    selectAll() {
        this.state = this.state.selectAll();
    }
}
