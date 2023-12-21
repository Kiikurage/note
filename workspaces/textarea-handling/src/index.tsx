import { createRoot } from 'react-dom/client';
import { EditorView } from './view/EditorView';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root')!;

    createRoot(container).render(<App />);
});

function App() {
    return (
        <div css={{ position: 'fixed', inset: 0 }}>
            <EditorView />
        </div>
    );
}
