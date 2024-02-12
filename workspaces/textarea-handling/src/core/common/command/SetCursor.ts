import { Command } from '../../../command/Command';
import { CommandService } from '../../../command/CommandService';
import { Editor } from '../Editor';
import { Cursor } from '../Cursor';
import { setCursor } from '../mutate/setCursor';

export const SetCursor = Command.define('SetCursor').withParams<{ cursor: Cursor }>();

CommandService.registerCommand(SetCursor, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => setCursor(state, command.cursor));
});
