import { Command } from '../../../core/common/Command';
import { Editor } from '../../../core/common/Editor';
import { CommandService } from '../../../core/common/CommandService';

export const SetCursorPosition = Command.define('SetCursorPosition').withParams<{ anchor: number; focus: number }>();

CommandService.registerCommand(SetCursorPosition, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.setCursorPosition(command.anchor, command.focus);
});
