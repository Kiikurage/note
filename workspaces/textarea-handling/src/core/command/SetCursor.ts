import { Command } from '../Command';
import { CommandService } from '../CommandService';
import { Cursor } from '../Cursor';
import { setCursor } from '../mutation/setCursor';

export const SetCursor = Command.define('SetCursor').withParams<{ cursor: Cursor }>();

CommandService.registerCommand(SetCursor, (command, editor) => {
    editor.updateState((state) => setCursor(state, command.cursor));
});
