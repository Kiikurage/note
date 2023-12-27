import { Channel, Disposable } from '../lib';
import { EditorState } from './EditorState';
import { getCommandService } from './CommandService';

export class Editor extends Disposable {
    readonly onChange = this.register(new Channel<EditorState>());

    private _state: EditorState = EditorState.create();

    constructor(commandService = getCommandService()) {
        super();

        commandService
            .registerCommandHandler('editor.action.selectAll', () => this.selectAll())
            .registerCommandHandler('deleteLeft', () => this.removeBackward())
            .registerCommandHandler('deleteRight', () => this.removeForward())
            .registerCommandHandler('cursorLeft', () => this.moveBackward())
            .registerCommandHandler('cursorLeftSelect', () => this.moveBackwardWithSelect())
            .registerCommandHandler('cursorHome', () => this.moveToLineBegin())
            .registerCommandHandler('cursorHomeSelect', () => this.moveToLineBeginWithSelect())
            .registerCommandHandler('cursorRight', () => this.moveForward())
            .registerCommandHandler('cursorRightSelect', () => this.moveForwardWithSelect())
            .registerCommandHandler('cursorEnd', () => this.moveToLineEnd())
            .registerCommandHandler('cursorEndSelect', () => this.moveToLineEndWithSelect());
    }

    get state() {
        return this._state;
    }

    private set state(state: EditorState) {
        this._state = state;
        this.onChange.fire(state);
    }

    focus() {
        this.state = this.state.copy({ active: true });
    }

    blur() {
        this.state = this.state.copy({ active: false });
    }

    setFocusState({ active, rootFocused }: { active: boolean; rootFocused: boolean }) {
        this.state = this.state.copy({
            active,
            focused: active && rootFocused,
        });
    }

    insertText(text: string) {
        this.state = this.state.insertText(text);
    }

    updateCompositionText(text: string, newSelectionAnchorOffset: number, newSelectionFocusOffset: number) {
        this.state = this.state.updateComposingText(text, newSelectionAnchorOffset, newSelectionFocusOffset);
    }

    startComposition() {
        this.state = this.state.startComposition();
    }

    endComposition() {
        this.state = this.state.endComposition();
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
