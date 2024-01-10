import { Node } from '../Node';

export class TextNode extends Node<{ text: string }> {
    get text() {
        return this.props.text;
    }

    get length() {
        return this.text.length;
    }

    setText(text: string): TextNode {
        if (text === this.text) return this;

        return this.copy({ text });
    }

    splice(offset: number, deleteCount: number, text = ''): TextNode {
        return this.setText(this.text.slice(0, offset) + text + this.text.slice(offset + deleteCount));
    }

    insertText(offset: number, text: string): TextNode {
        return this.splice(offset, 0, text);
    }

    deleteByOffset(offset: number, deleteCount: number): TextNode {
        return this.splice(offset, deleteCount, '');
    }
}
