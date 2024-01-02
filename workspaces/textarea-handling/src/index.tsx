import { createRoot } from 'react-dom/client';
// import { EditorView } from './view/EditorView';
import { EditableContentHost } from './core/view/EditableContentHost';
import { EditorProvider } from './core/view/EditorProvider';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root')!;

    // initKeyBindingService();
    createRoot(container).render(
        <div css={{ position: 'fixed', inset: 16 }}>
            <EditorProvider>
                <EditableContentHost />
            </EditorProvider>
        </div>,
    );
});
//
// function App() {
//     return (
//         <div css={{ position: 'fixed', inset: 0 }}>
//             <EditorView />
//         </div>
//     );
// }
