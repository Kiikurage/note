import { Channel, Disposable } from '../../lib';
import { EditorState } from './EditorState';
import { DIContainer } from './DIContainer';
import { Logger } from '../../lib/logger';

export class Editor extends Disposable {
    static readonly ServiceKey = DIContainer.register(() => new Editor());

    readonly onChange = this.register(new Channel<EditorState>());

    private _state: EditorState = EditorState.create();
    private readonly logger = new Logger(Editor.name);

    get state() {
        return this._state;
    }

    private set state(state: EditorState) {
        this._state = state;
        this.onChange.fire(state);
    }

    insertText(text: string) {
        this.state = this.state.insertText(text);
    }

    removeSelectedRanges() {
        this.state = this.state.removeSelectedRanges();
    }

    getSelectedText() {
        return this.state.value.slice(this.state.cursors[0].from, this.state.cursors[0].to);
    }

    deleteBackward() {
        this.state = this.state.deleteBackward();
    }

    deleteForward() {
        this.state = this.state.deleteForward();
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

    addCursor(offset: number) {
        this.state = this.state.addCursor(offset);
    }

    setCursorPosition(anchor: number, focus: number = anchor) {
        this.state = this.state.setCursorPosition(anchor, focus);
    }
}
