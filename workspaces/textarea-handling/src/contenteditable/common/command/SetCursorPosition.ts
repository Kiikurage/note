import { Command } from '../../../core/common/Command';
import { CommandService } from '../../../core/common/CommandService';
import { Position } from '../../../core/common/core/Position';
import { Editor } from '../../../core/common/core/Editor';
import { Cursor } from '../../../core/common/core/Cursor';

export const SetCursorPosition = Command.define('SetCursorPosition').withParams<{
    anchor: Position;
    focus: Position;
}>();

CommandService.registerCommand(SetCursorPosition, (command, container) => {
    container.get(Editor.ServiceKey).updateState((oldState) => {
        return oldState.copy({
            cursor: Cursor.of(command.anchor, command.focus),
        });
    });
});
