'use client';

import React, { useEffect, useRef } from 'react';

interface PageRendererProps {
  html: string;
  css?: string;
  meta_title?: string;
  meta_description?: string;
}

/**
 * Renders a page built with GrapesJS Studio editor.
 * 
 * The editor outputs:
 * - `html`: raw HTML markup from editor.getHtml() — may contain <body> wrapper and <script> tags
 * - `css`: compiled CSS from editor.getCss()
 * 
 * This component:
 * 1. Strips <body> wrapper tags to avoid nested <body> issues
 * 2. Separates <script> tags from HTML and executes them after mount
 * 3. Injects page CSS with proper isolation from admin dark theme
 */
export default function PageRenderer({ html, css }: PageRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Separate scripts from HTML (React's dangerouslySetInnerHTML doesn't execute scripts)
  const { cleanHtml, scripts } = React.useMemo(() => {
    let processedHtml = html || '';

    // Strip <body> and </body> wrapper tags
    processedHtml = processedHtml.replace(/^<body>/, '').replace(/<\/body>$/, '');

    // Extract <script> tags
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    const extractedScripts: string[] = [];
    let match;
    while ((match = scriptRegex.exec(processedHtml)) !== null) {
      extractedScripts.push(match[1]);
    }

    // Remove scripts from HTML
    const htmlWithoutScripts = processedHtml.replace(scriptRegex, '');

    return { cleanHtml: htmlWithoutScripts, scripts: extractedScripts };
  }, [html]);

  // Execute scripts after the HTML is rendered in the DOM
  useEffect(() => {
    if (scripts.length > 0 && contentRef.current) {
      scripts.forEach((scriptContent) => {
        try {
          const scriptEl = document.createElement('script');
          scriptEl.textContent = scriptContent;
          contentRef.current?.appendChild(scriptEl);
        } catch (err) {
          console.error('Error executing page script:', err);
        }
      });
    }
  }, [scripts]);

  const fullCss = `
    /* Override root dark theme for public pages */
    body {
      background-color: #ffffff !important;
      color: #333333 !important;
    }

    /* Reset for user-facing pages */
    .grapes-page-wrapper {
      background: #ffffff;
      color: #333333;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.5;
    }
    .grapes-page-wrapper * {
      box-sizing: border-box;
    }
    .grapes-page-wrapper img {
      max-width: 100%;
      height: auto;
    }
    .grapes-page-wrapper a {
      color: inherit;
    }

    /* GrapesJS editor CSS output */
    ${css || ''}
  `;

  return (
    <div className="grapes-page-wrapper">
      <style dangerouslySetInnerHTML={{ __html: fullCss }} />
      <div ref={contentRef} dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </div>
  );
}
