import { EventTargetWrapper } from './eventTarget';

export class DomWrapper extends EventTargetWrapper {
    constructor(private readonly element: Element) {
        super(element);
    }

    public override dispose() {
        this.element.parentElement?.removeChild(this.element);
        super.dispose();
    }
}

export function dom<T extends Element>(dom: T): DomWrapper {
    return new DomWrapper(dom);
}
