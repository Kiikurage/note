import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { Cursor } from '../Cursor';
import { setCursor } from '../mutation/setCursor';

export const SetCursor = Command.define('SetCursor').withParams<{ cursor: Cursor }>();

CommandService.registerCommand(SetCursor, (command, editor) => {
    editor.updateState((state) => setCursor(state, command.cursor));
});
