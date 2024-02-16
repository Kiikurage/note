import { createRoot } from 'react-dom/client';
import { EditorView } from './core/react/EditorContextProvider';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root')!;

    createRoot(container).render(
        <div css={{ position: 'fixed', inset: 16 }}>
            <EditorView />
            {/*<EditorContextProvider extensions={[ContentEditableExtension, HistoryExtension, DebugExtension]}>*/}
            {/*    <div*/}
            {/*        css={{*/}
            {/*            position: 'absolute',*/}
            {/*            top: 0,*/}
            {/*            left: 0,*/}
            {/*            bottom: 0,*/}
            {/*            width: '50%',*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        <DocView />*/}
            {/*    </div>*/}
            {/*    <div*/}
            {/*        css={{*/}
            {/*            position: 'absolute',*/}
            {/*            top: 0,*/}
            {/*            right: 0,*/}
            {/*            bottom: 0,*/}
            {/*            width: '50%',*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        <DebugView />*/}
            {/*    </div>*/}
            {/*</EditorContextProvider>*/}
        </div>,
    );
});
