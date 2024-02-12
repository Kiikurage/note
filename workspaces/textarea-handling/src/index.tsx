import { createRoot } from 'react-dom/client';
import { DebugExtension } from './debug';
import { DebugView } from './debug/DebugView';
import { HistoryExtension } from './history';
import { DIContainerProvider } from './core/react/DIContainerProvider';
import { ContentEditableExtension } from './core';
import { EditableContentHost } from './core/react/EditableContentHost';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root')!;

    createRoot(container).render(
        <div css={{ position: 'fixed', inset: 16 }}>
            <DIContainerProvider extensions={[ContentEditableExtension, HistoryExtension, DebugExtension]}>
                <div
                    css={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '50%',
                    }}
                >
                    <EditableContentHost />
                </div>
                <div
                    css={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: '50%',
                    }}
                >
                    <DebugView />
                </div>
            </DIContainerProvider>
        </div>,
    );
});
