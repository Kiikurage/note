import { Command } from '../command/Command';
import { CommandService } from '../command/CommandService';
import { Editor } from '../core/Editor';
import { insertLinkToSelection } from './insertLinkToSelection';

export const InsertLink = Command.define('insertLink');

CommandService.registerCommand(InsertLink, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => {
        return insertLinkToSelection(state);
    });
});
