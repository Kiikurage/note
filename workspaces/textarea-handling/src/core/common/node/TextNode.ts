import { Node } from '../core/Node';

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

    insertText(offset: number, text: string): TextNode {
        return this.setText(this.text.slice(0, offset) + text + this.text.slice(offset));
    }

    deleteByOffset(offset: number): TextNode {
        return this.setText(this.text.slice(0, offset) + this.text.slice(offset + 1));
    }
}
