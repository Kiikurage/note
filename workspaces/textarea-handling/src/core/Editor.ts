import { Channel, Disposable } from '../lib';
import { EditorState } from './EditorState';
import { DIContainer } from '../lib/DIContainer';
import { Logger } from '../lib/logger';

export class Editor extends Disposable {
    static readonly ServiceKey = DIContainer.register(() => new Editor());

    readonly onChange = this.register(new Channel<EditorState>());

    private _state: EditorState = EditorState.create();

    get state() {
        return this._state;
    }

    updateState(updater: (state: EditorState) => EditorState) {
        this._state = updater(this.state);
        this.onChange.fire(this.state);
    }
}

const logger = Logger.of(Editor);
