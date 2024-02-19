import { Clipboard } from './Clipboard';
import { defineComponent } from './Editor';
import { DocNode } from './node/DocNode';

export class OnMemoryClipboard implements Clipboard {
    static readonly ComponentKey = defineComponent(() => new OnMemoryClipboard());
    private data: DocNode[] = [];

    async read() {
        return this.data;
    }

    async write(contents: DocNode[]) {
        this.data = contents;
    }
}
