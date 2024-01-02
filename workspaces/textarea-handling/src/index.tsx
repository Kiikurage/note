import { createRoot } from 'react-dom/client';
import { EditableContentHost } from './contenteditable/view/EditableContentHost';
import { DIContainerProvider } from './core/view/DIContainerProvider';
import { ClipboardExtension } from './clipboard';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root')!;

    createRoot(container).render(
        <div css={{ position: 'fixed', inset: 16 }}>
            <DIContainerProvider extensions={[ClipboardExtension]}>
                <EditableContentHost />
            </DIContainerProvider>
        </div>,
    );
});
