import { Channel, Disposable } from '../../lib';
import { EditorState } from './EditorState';
import { DIContainer } from './DIContainer';
import { Logger } from '../../lib/logger';
import { Position } from './Cursor';

export class Editor extends Disposable {
    static readonly ServiceKey = DIContainer.register(() => new Editor());

    readonly onChange = this.register(new Channel<EditorState>());

    private _state: EditorState = EditorState.create();
    private readonly logger = new Logger(Editor.name);

    get state() {
        return this._state;
    }

    private set state(state: EditorState) {
        if (this.state === state) return;

        this._state = state;
        this.onChange.fire(state);
    }

    insertText(text: string) {
        this.state = this.state.insertText(text);
    }

    deleteSelectedRanges() {
        this.state = this.state.deleteSelectedRanges();
    }

    getSelectedText() {
        // return this.state.value.slice(this.state.cursors[0].from, this.state.cursors[0].to);
        return '<getSelectedText() is temporarily disabled>';
    }

    deleteBackward() {
        this.state = this.state.deleteBackward();
    }

    deleteForward() {
        this.state = this.state.deleteForward();
    }

    setCursorPosition(anchor: Position, focus: Position = anchor) {
        this.state = this.state.setCursorPosition(anchor, focus);
    }
}
