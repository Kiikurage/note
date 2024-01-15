import { Command } from '../command/Command';
import { CommandService } from '../command/CommandService';
import { Editor } from '../core/Editor';
import { toggleLinkAtSelection } from './toggleLinkAtSelection';

export const ToggleLink = Command.define('toggleLink');

CommandService.registerCommand(ToggleLink, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => {
        return toggleLinkAtSelection(state);
    });
});
