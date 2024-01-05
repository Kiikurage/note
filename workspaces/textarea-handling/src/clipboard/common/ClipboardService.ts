import { DIContainer } from '../../core/common/DIContainer';
import { Editor } from '../../core/common/core/Editor';
import { Node } from '../../core/common/core/Node';

export class ClipboardService {
    static readonly ServiceKey = DIContainer.register(
        (container) => new ClipboardService(container.get(Editor.ServiceKey)),
    );

    private data: Node[][] = [];

    constructor(private readonly editor: Editor) {}

    copy() {
        // this.data = this.editor.state.getSelectedData();
    }

    cut() {
        this.copy();
        // this.editor.updateState((oldState) => oldState.deleteSelectedRangesForEachCursor());
    }

    paste() {
        // this.editor.updateState((oldState) =>
        //     oldState
        //         .deleteSelectedRangesForEachCursor()
        //         .updateForEachCursor((state, cursor) => state.insertNodesAt(cursor.from.path, this.data.shift() ?? [])),
        // );
    }
}
