import { Node } from '../core/Node';
import { assert } from '../../../lib';

export class TextNode extends Node<{ text: string }> {
    readonly isContainer = false;

    get text() {
        return this.props.text;
    }

    get length() {
        return this.text.length;
    }

    setText(text: string): TextNode {
        return this.copy({ text });
    }

    insert(offset: number, node: Node): Node {
        throw new Error('TextNode.insert() is not supported');
    }

    insertText(offset: number, text: string): TextNode {
        return this.setText(this.text.slice(0, offset) + text + this.text.slice(offset));
    }

    deleteByOffset(offset: number): TextNode {
        return this.setText(this.text.slice(0, offset) + this.text.slice(offset + 1));
    }

    join(other: Node): Node[] {
        if (!(other instanceof TextNode)) return super.join(other);

        return [this.setText(this.text + other.text)];
    }

    splice(start: number, deleteCount: number, ...nodes: Node[]): Node {
        assert(nodes.length === 0, 'TextNode.splice() must not have nodes');

        return this.copy({ text: this.text.slice(0, start) + this.text.slice(start + deleteCount) });
    }

    split(offset: number): [before: Node | null, after: Node | null] {
        if (offset === 0) return [null, this];
        if (offset === this.length) return [this, null];

        return [
            this.copy({ text: this.text.slice(0, offset) }, [], Node.generateId()),
            this.copy({ text: this.text.slice(offset) }, [], Node.generateId()),
        ];
    }
}
