import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { Position } from '../../../core/Position';
import { Editor } from '../../../core/Editor';
import { Cursor } from '../../../core/Cursor';

export const SetCursorPosition = Command.define('SetCursorPosition').withParams<{
    anchor: Position;
    focus: Position;
}>();

CommandService.registerCommand(SetCursorPosition, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => state.setCursor(Cursor.of(command.anchor, command.focus)));
});
