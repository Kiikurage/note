import { createEditorState, EditorState } from './EditorState';
import { Channel } from '../lib/Channel';

export interface ComponentKey<T> {
    instantiate: (editor: Editor) => T;
}

export function defineComponent<T>(factory: (editor: Editor) => T): ComponentKey<T> {
    return { instantiate: factory };
}

export class Editor {
    readonly onChange = new Channel<EditorState>();
    private readonly components = new Map<ComponentKey<unknown>, unknown>();

    private _state = createEditorState();

    get state() {
        return this._state;
    }

    updateState(updater: (state: EditorState) => EditorState) {
        this._state = updater(this.state);
        this.onChange.fire(this.state);
    }

    getComponent<T>(key: ComponentKey<T>): T {
        let component = this.components.get(key) as T | undefined;
        if (component === undefined) {
            component = key.instantiate(this) as T;
            this.components.set(key, component);
        }
        return component;
    }
}
