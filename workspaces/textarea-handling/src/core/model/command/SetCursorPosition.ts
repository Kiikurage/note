import { Command } from '../Command';
import { Editor } from '../Editor';
import { CommandService } from '../CommandService';

export const SetCursorPosition = Command.define('SetCursorPosition').withParams<{ anchor: number; focus: number }>();

CommandService.registerCommand(SetCursorPosition, (command, container) => {
    const editor = container.get(Editor.ServiceKey);

    editor.setCursorPosition(command.anchor, command.focus);
});
