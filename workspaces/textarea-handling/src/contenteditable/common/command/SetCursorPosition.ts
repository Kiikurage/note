// import { Command } from '../../../core/common/Command';
// import { CommandService } from '../../../core/common/CommandService';
// import { Position } from '../../../core/common/core/Position';
// import { Editor } from '../../../core/common/core/Editor';
//
// export const SetCursorPosition = Command.define('SetCursorPosition').withParams<{
//     anchor: Position;
//     focus: Position;
// }>();
//
// CommandService.registerCommand(SetCursorPosition, (command, container) => {
//     container
//         .get(Editor.ServiceKey)
//         .updateState((oldState) => oldState.setCursorPosition(command.anchor, command.focus));
// });
