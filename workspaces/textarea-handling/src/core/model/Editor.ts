import { Channel, Disposable } from '../../lib';
import { EditorState } from './EditorState';
import { CommandService } from './CommandService';
import { ICommand } from './Command';
import { DIContainer } from '../../lib/DIContainer';

export class Editor extends Disposable {
    static readonly ServiceKey = DIContainer.register(
        (container) => new Editor(container.get(CommandService.ServiceKey)),
    );

    readonly onChange = this.register(new Channel<EditorState>());

    private _state: EditorState = EditorState.create();

    constructor(private readonly commandService: CommandService) {
        super();
    }

    get state() {
        return this._state;
    }

    private set state(state: EditorState) {
        this._state = state;
        this.onChange.fire(state);
    }

    execCommand(command: ICommand) {
        this.commandService.exec(command);
    }

    insertText(text: string) {
        this.state = this.state.insertText(text);
    }

    removeSelectedRanges() {
        this.state = this.state.removeSelectedRanges();
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
