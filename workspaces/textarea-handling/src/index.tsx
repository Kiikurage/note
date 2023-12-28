import { createRoot } from 'react-dom/client';
import { EditorView } from './view/EditorView';
import { initKeyBindingService } from './view/bootstrap';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root')!;

    initKeyBindingService();
    createRoot(container).render(<App />);
});

function App() {
    return (
        <div css={{ position: 'fixed', inset: 0 }}>
            <EditorView />
        </div>
    );
}
