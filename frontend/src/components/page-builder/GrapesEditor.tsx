'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

// Plugin imports
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsForms from 'grapesjs-plugin-forms';

export interface PageData {
  html: string;
  css: string;
}

export interface GrapesEditorProps {
  initialContent?: PageData;
  onSave?: (data: PageData) => void;
}

export interface GrapesEditorHandle {
  insertBlock: (html: string, css?: string) => void;
}

const GrapesEditor = forwardRef<GrapesEditorHandle, GrapesEditorProps>(function GrapesEditor({ initialContent, onSave }, ref) {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSaveRef = useRef(onSave);
  
  // Keep the ref up to date
  onSaveRef.current = onSave;

  // Expose editor methods to parent via ref
  useImperativeHandle(ref, () => ({
    insertBlock: (html: string, css?: string) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.addComponents(html);
      if (css) {
        editor.CssComposer.addRules(css);
      }
    },
  }));

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100vh',
      width: 'auto',
      storageManager: false,
      // Load plugins
      plugins: [
        gjsPresetWebpage,
        gjsBlocksBasic,
        gjsForms
      ],
      pluginsOpts: {
        [gjsPresetWebpage as unknown as string]: {
          modalImportTitle: 'Import',
          modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
          modalImportContent: '',
        },
        [gjsBlocksBasic as unknown as string]: { flexGrid: true },
        [gjsForms as unknown as string]: {},
      },
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
          'https://cdn.tailwindcss.com'
        ],
      },
    });

    editorRef.current = editor;

    // Load initial content after editor is ready
    editor.on('load', () => {
      if (initialContent?.html) {
        editor.setComponents(initialContent.html);
      }
      if (initialContent?.css) {
        editor.setStyle(initialContent.css);
      }
      // Notify parent after loading initial content
      setTimeout(() => {
        notifyChange();
      }, 100);
    });

    // ==================== CUSTOM BLOCKS ====================
    const bm = editor.BlockManager;

    // Event Card Block
    bm.add('event-card', {
      label: 'Event Card',
      category: 'Events',
      content: `
        <div class="event-card" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 400px; font-family: 'Inter', sans-serif;">
          <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop" style="width: 100%; height: 200px; object-fit: cover;" alt="Event" />
          <div style="padding: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">Conference</span>
              <span style="color: #6b7280; font-size: 12px;">Mar 15, 2024</span>
            </div>
            <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Tech Summit 2024</h3>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0; line-height: 1.5;">Join industry leaders for a day of insights and networking.</p>
            <a href="#" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">Register Now</a>
          </div>
        </div>
      `,
    });

    // Pricing Table Block
    bm.add('pricing-table', {
      label: 'Pricing Table',
      category: 'Sections',
      content: `
        <section style="padding: 60px 20px; background: #f8fafc; font-family: 'Inter', sans-serif;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="font-size: 32px; font-weight: 700; color: #1f2937;">Simple Pricing</h2>
              <p style="color: #6b7280; font-size: 18px;">Choose the plan that suits you best</p>
            </div>
            <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
              <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; width: 300px;">
                <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 10px;">Basic</h3>
                <div style="font-size: 36px; font-weight: 700; color: #1f2937; margin-bottom: 20px;">$29<span style="font-size: 16px; font-weight: 400; color: #6b7280;">/mo</span></div>
                <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; color: #4b5563;">
                  <li style="margin-bottom: 12px;">✓ 5 Projects</li>
                  <li style="margin-bottom: 12px;">✓ Basic Analytics</li>
                  <li style="margin-bottom: 12px;">✓ 24/7 Support</li>
                </ul>
                <button style="width: 100%; padding: 12px; border: 1px solid #3b82f6; background: white; color: #3b82f6; border-radius: 8px; font-weight: 600; cursor: pointer;">Get Started</button>
              </div>
              <div style="background: white; border: 2px solid #3b82f6; border-radius: 16px; padding: 32px; width: 300px; transform: scale(1.05);">
                <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Most Popular</span>
                <h3 style="font-size: 20px; font-weight: 600; margin: 10px 0;">Pro</h3>
                <div style="font-size: 36px; font-weight: 700; color: #1f2937; margin-bottom: 20px;">$59<span style="font-size: 16px; font-weight: 400; color: #6b7280;">/mo</span></div>
                 <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; color: #4b5563;">
                  <li style="margin-bottom: 12px;">✓ Unlimited Projects</li>
                  <li style="margin-bottom: 12px;">✓ Advanced Analytics</li>
                  <li style="margin-bottom: 12px;">✓ Priority Support</li>
                </ul>
                <button style="width: 100%; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Get Started</button>
              </div>
            </div>
        </section>
      `,
    });

    // TinyMCE Rich Text Block
    bm.add('tinymce-text', {
      label: 'Rich Text (MCE)',
      category: 'Content',
      content: `
        <div class="rich-text-block" style="padding: 32px; background: white; border-radius: 12px; font-family: 'Inter', sans-serif;">
          <h2 style="font-size: 28px; font-weight: 700; color: #1f2937; margin-bottom: 16px;">Enter your heading here</h2>
          <p style="font-size: 16px; line-height: 1.7; color: #4b5563; margin-bottom: 16px;">
            This is a rich text block powered by TinyMCE editor. Click to edit this content and format it with the toolbar above. You can add <strong>bold</strong>, <em>italic</em>, <u>underlined</u> text, lists, links, and more.
          </p>
          <ul style="list-style: disc; padding-left: 24px; color: #4b5563; margin-bottom: 16px;">
            <li style="margin-bottom: 8px;">First feature or benefit point</li>
            <li style="margin-bottom: 8px;">Second feature or benefit point</li>
            <li style="margin-bottom: 8px;">Third feature or benefit point</li>
          </ul>
          <p style="font-size: 16px; line-height: 1.7; color: #4b5563;">
            Create engaging content that converts visitors into customers.
          </p>
        </div>
      `,
    });

    // Hero Section Block
    bm.add('hero-section', {
      label: 'Hero Section',
      category: 'Sections',
      content: `
        <section style="padding: 100px 20px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; font-family: 'Inter', sans-serif;">
          <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 20px;">Build Faster with GrapesJS</h1>
          <p style="font-size: 20px; color: #94a3b8; max-width: 600px; margin: 0 auto 40px;">The next generation page builder for your SaaS applications.</p>
          <div style="display: flex; gap: 16px; justify-content: center;">
            <a href="#" style="background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Get Started</a>
            <a href="#" style="background: rgba(255,255,255,0.1); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Learn More</a>
          </div>
        </section>
      `,
    });

    // Track changes and notify parent
    const notifyChange = () => {
      const html = editor.getHtml();
      const css = editor.getCss() || '';
      const pageData = { html, css };
      onSaveRef.current?.(pageData);
    };

    // Listen for changes
    editor.on('change:changesCount', notifyChange);
    editor.on('component:add', notifyChange);
    editor.on('component:remove', notifyChange);
    editor.on('component:update', notifyChange);
    
    // Initial save
    notifyChange();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="h-full border-t border-gray-200" />;
});

export default GrapesEditor;
