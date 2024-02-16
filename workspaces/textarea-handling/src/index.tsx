import { createRoot } from 'react-dom/client';
import { EditorView } from './react/EditorView';

window.addEventListener('DOMContentLoaded', () => {
    createRoot(document.getElementById('root')!).render(<EditorView />);
});
