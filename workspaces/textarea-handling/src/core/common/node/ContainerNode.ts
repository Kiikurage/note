import { Node } from '../core/Node';

export class ContainerNode extends Node {
    readonly isContainer = true;

    join(other: Node): Node[] {
        if (!other.isContainer) return super.join(other);

        const children = [...this.children, ...other.children];
        // if (this.length > 0 && other.length > 0) {
        //     children.splice(this.length - 1, 2, ...children[this.length - 1].join(children[this.length]));
        // }

        return [this.copy({}, children)];
    }

    split(offset: number): [before: Node | null, after: Node | null] {
        const children1 = this.children.slice(0, offset);
        const children2 = this.children.slice(offset);
        return [this.copy({}, children1, Node.generateId()), this.copy({}, children2, Node.generateId())];
    }
}
