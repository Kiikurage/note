import { extension } from '../core/common/Extension';
import { KeyBindingService } from './common/KeyBindingService';
import { Editor } from '../core/common/Editor';

export const KeyBindingExtension = extension({
    name: 'KeyBinding',
    setup(editor: Editor) {
        editor.getComponent(KeyBindingService.ComponentKey);
    },
});
