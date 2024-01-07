import { Command } from '../core/common/Command';
import { CommandService } from '../core/common/CommandService';
import { Editor } from '../core/common/core/Editor';
import { insertLinkToSelection } from './insertLinkToSelection';

export const InsertLink = Command.define('insertLink');

CommandService.registerCommand(InsertLink, (command, container) => {
    container.get(Editor.ServiceKey).updateState((state) => {
        return insertLinkToSelection(state);
    });
});
