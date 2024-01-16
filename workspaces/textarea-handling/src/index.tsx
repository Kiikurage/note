import { createRoot } from 'react-dom/client';
import { EditableContentHost } from './contenteditable/EditableContentHost';
import { DIContainerProvider } from './contenteditable/DIContainerProvider';
import { ClipboardExtension } from './clipboard';
import { SerializeExtension } from './serialize';
import { DebugExtension } from './debug';
import { DebugView } from './debug/DebugView';
import { HistoryExtension } from './history';
import { ContentEditableExtension } from './contenteditable';
import { CodeExtension } from './code';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root')!;

    createRoot(container).render(
        <div css={{ position: 'fixed', inset: 16 }}>
            <DIContainerProvider
                extensions={[
                    ContentEditableExtension,
                    CodeExtension,
                    HistoryExtension,
                    DebugExtension,
                    ClipboardExtension,
                    SerializeExtension,
                ]}
            >
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
