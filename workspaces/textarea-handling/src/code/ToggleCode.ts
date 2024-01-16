import { Command } from '../command/Command';
import { CommandService } from '../command/CommandService';
import { Editor } from '../core/Editor';
import { toggleCodeAtSelection } from './toggleCodeAtSelection';

export const ToggleCode = Command.define('toggleCode');

CommandService.registerCommand(ToggleCode, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => toggleCodeAtSelection(state));
});
