import { EditorState } from '../core/EditorState';

export interface ClipboardService {
    cut(editorState: EditorState): Promise<void>;

    copy(editorState: EditorState): Promise<void>;

    paste(editorState: EditorState): Promise<void>;
}
