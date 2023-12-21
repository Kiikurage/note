import { Channel, Disposable } from '../lib';
import { EditorState } from './EditorState';
import { InputReceiver } from './InputReceiver';
import { Logger } from '../lib/logger';

export class Editor extends Disposable {
    readonly onChange = this.register(new Channel<EditorState>());

    #state: EditorState = EditorState.create();
    private readonly inputReceiver = this.register(new InputReceiver());

    constructor() {
        super();

        this.inputReceiver.onInsert.addListener((text) => {
            this.state = this.state.insertText(text);
        });
        this.inputReceiver.onCompositionChange.addListener((text) => {
            this.state = this.state.setCompositionValue(text);
        });
        this.inputReceiver.onCompositionEnd.addListener(() => {
            this.state = this.state.insertText(this.state.compositionValue).setCompositionValue('');
        });
        this.inputReceiver.onKeyDown.addListener((ev) => {
            switch (ev.key) {
                case 'a':
                    if (ev.metaKey) {
                        this.selectAll();
                        ev.preventDefault();
                    }
                    break;

                case 'Backspace':
                    this.removeBackward();
                    ev.preventDefault();
                    break;

                case 'Delete':
                    this.removeForward();
                    ev.preventDefault();
                    break;

                case 'ArrowLeft':
                    if (ev.shiftKey) {
                        if (ev.metaKey) {
                            this.moveToLineBeginWithSelect();
                            ev.preventDefault();
                        } else {
                            this.moveBackwardWithSelect();
                            ev.preventDefault();
                        }
                    } else {
                        if (ev.metaKey) {
                            this.moveToLineBegin();
                            ev.preventDefault();
                        } else {
                            this.moveBackward();
                            ev.preventDefault();
                        }
                    }
                    break;

                case 'ArrowRight':
                    if (ev.shiftKey) {
                        if (ev.metaKey) {
                            this.moveToLineEndWithSelect();
                            ev.preventDefault();
                        } else {
                            this.moveForwardWithSelect();
                            ev.preventDefault();
                        }
                    } else {
                        if (ev.metaKey) {
                            this.moveToLineEnd();
                            ev.preventDefault();
                        } else {
                            this.moveForward();
                            ev.preventDefault();
                        }
                    }
                    break;

                default:
                    logger.log(`onKeyDown key=${ev.key}`);
            }
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

const logger = new Logger(Editor.name);
