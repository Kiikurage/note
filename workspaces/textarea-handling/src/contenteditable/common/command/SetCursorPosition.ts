import { Command } from '../../../core/common/Command';
import { Editor } from '../../../core/common/Editor';
import { CommandService } from '../../../core/common/CommandService';
import { Position } from '../../../core/common/Cursor';

export const SetCursorPosition = Command.define('SetCursorPosition').withParams<{
    anchor: Position;
    focus: Position;
}>();

CommandService.registerCommand(SetCursorPosition, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.setCursorPosition(command.anchor, command.focus);
});
