import { Node } from '../core/Node';

export class TextNode extends Node<{ text: string }> {
    readonly isContainer = false;

    get text() {
        return this.props.text;
    }

    setText(text: string): TextNode {
        return this.copy({ text });
    }

    insertText(offset: number, text: string): TextNode {
        return this.setText(this.text.slice(0, offset) + text + this.text.slice(offset));
    }
}
