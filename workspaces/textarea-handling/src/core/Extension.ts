import { ComponentKey, Editor, defineComponent } from './Editor';

export abstract class Extension {
    abstract readonly name: string;
}

export function extension(props: {
    name: string;
    dependencies?: ComponentKey<Extension>[];
    setup(editor: Editor): void;
}): ComponentKey<Extension> {
    const { name, dependencies = [], setup } = props;

    const ExtensionClass = class extends Extension {
        readonly name = name;

        constructor(editor: Editor) {
            super();

            for (const dependency of dependencies) editor.getComponent(dependency);
            setup(editor);
        }
    };

    return defineComponent((editor) => new ExtensionClass(editor));
}
