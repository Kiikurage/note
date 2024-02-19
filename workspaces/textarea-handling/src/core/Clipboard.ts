import { DocNode } from './node/DocNode';

export interface Clipboard {
    read(): Promise<DocNode[]>;

    write(contents: DocNode[]): Promise<void>;
}
