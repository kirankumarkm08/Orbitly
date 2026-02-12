'use client';

import StudioEditor from '@grapesjs/studio-sdk/react';
import '@grapesjs/studio-sdk/style';
import { useState } from 'react';

export interface PageData {
  html: string;
  css: string;
  components: string;
  styles: string;
}

export interface StudioEditorProps {
  initialContent?: PageData;
  onSave?: (data: PageData) => void;
  onLoad?: () => void;
  isSaving?: boolean;
  licenseKey?: string;
}

export default function GrapesStudioEditor({
  initialContent,
  onSave,
  onLoad,
  isSaving = false,
  licenseKey = '',
}: StudioEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const handleSaveClick = () => {
    if (editorInstance && !isSaving) {
      const data: PageData = {
        html: editorInstance.getHtml(),
        css: editorInstance.getCss() || '',
        components: JSON.stringify(editorInstance.getComponents()),
        styles: JSON.stringify(editorInstance.getStyle()),
      };
      onSave?.(data);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#ffffff', position: 'relative' }}>
      <button
        onClick={handleSaveClick}
        disabled={isSaving}
        style={{
          position: 'absolute',
          top: '12px',
          right: '80px',
          zIndex: 1000,
          padding: '10px 24px',
          background: isSaving ? '#94a3b8' : 'linear-gradient(135deg, #02a763 0%, #00d27a 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(2, 167, 99, 0.3)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {isSaving ? (
          <>
            <div className="save-spinner" />
            Saving...
          </>
        ) : (
          'Save Page'
        )}
      </button>

      <style>{`
        body { margin: 0; }
        .gjs-studio-editor { background: #ffffff; }
        .save-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <StudioEditor
        style={{ flexGrow: 1 }}
        options={{
          licenseKey: licenseKey,
          storage: {
            type: 'self',
            onSave: async () => {
              handleSaveClick();
            },
          },
          gjsOptions: { 
            storageManager: false,
          },
          onReady: (editor: {
            Commands: { add: (name: string, obj: { run: () => void }) => void };
            runCommand: (name: string) => void;
            getHtml: () => string;
            getCss: () => string | undefined;
            getComponents: () => unknown;
            getStyle: () => unknown;
          }) => {
            setEditorInstance(editor);

            if (typeof window !== 'undefined') {
              (window as unknown as { studioEditor: typeof editor }).studioEditor = editor;
            }
            onLoad?.();
          },
          theme: 'light',
          project: {
            default: {
              pages: [
                { 
                  name: 'Home', 
                  component: initialContent?.html || `
                    <div style="padding: 100px 20px; text-align: center; font-family: sans-serif;">
                      <h1 style="font-size: 48px;">New Page</h1>
                      <p style="font-size: 18px; color: #666;">Start building your page here...</p>
                    </div>
                  `
                }
              ]
            }
          },
          layout: {
            default: {
              type: 'row',
              style: { height: '100%', background: '#ffffff' },
              children: [
                { type: 'sidebarLeft' },
                {
                  type: 'column',
                  style: { flexGrow: 1 },
                  children: [
                    { type: 'sidebarTop' },
                    { type: 'canvas' }
                  ]
                },
                { type: 'sidebarRight' }
              ]
            }
          }
        }}
      />
    </div>
  );
}
