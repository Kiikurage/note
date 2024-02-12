import { EditorState } from '../core/common/EditorState';
import { Editor } from '../core/common/Editor';
import { DIContainer } from '../lib/DIContainer';

export class EditorHistory {
    static readonly ServiceKey = DIContainer.register(
        (container) => new EditorHistory(container.get(Editor.ServiceKey)),
    );

    constructor(
        private readonly editor: Editor,
        private readonly buffer: EditorState[] = [],
        private index = 0,
    ) {
        this.buffer.push(editor.state);
        this.editor.onChange.addListener(this.handleEditorChange);
    }

    get canUndo() {
        return this.index > 0;
    }

    get canRedo() {
        return this.index < this.buffer.length - 1;
    }

    undo() {
        if (!this.canUndo) return;

        this.index--;
        this.editor.updateState(() => this.buffer[this.index]);
    }

    redo() {
        if (!this.canRedo) return;

        this.index++;
        this.editor.updateState(() => this.buffer[this.index]);
    }

    private readonly handleEditorChange = () => {
        // if (this.editor.state.doc === this.buffer[this.index].doc) return;

        this.buffer.length = this.index + 1;
        this.index++;
        this.buffer.push(this.editor.state);
    };
}
