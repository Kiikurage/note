import { EventTargetHolder } from './eventTarget';

export class ElementHolder<T extends Element = Element> extends EventTargetHolder<T> {
    constructor(readonly element: T) {
        super(element);
    }

    public override dispose() {
        this.element.parentElement?.removeChild(this.element);
        super.dispose();
    }
}

export function element<T extends Element>(element: T): ElementHolder<T> {
    return new ElementHolder(element);
}
