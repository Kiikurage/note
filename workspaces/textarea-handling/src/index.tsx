import { createRoot } from 'react-dom/client';
import { EditableContentHost } from './contenteditable/view/EditableContentHost';
import { DIContainerProvider, useService } from './core/view/DIContainerProvider';
import { ClipboardExtension } from './clipboard';
import { Path } from './core/common/core/Path';
import { useEditorState } from './core/view/useEditorState';
import { Editor } from './core/common/core/Editor';
import { DebugView } from './core/view/DebugView';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root')!;

    createRoot(container).render(
        <div css={{ position: 'fixed', inset: 16 }}>
            <DIContainerProvider extensions={[ClipboardExtension]}>
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
