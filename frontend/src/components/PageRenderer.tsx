'use client';

interface PageRendererProps {
  html: string;
  css?: string;
  meta_title?: string;
  meta_description?: string;
}

export default function PageRenderer({ html, css }: PageRendererProps) {
  // Ensure we have valid HTML
  const safeHtml = html || '<div style="padding: 40px; text-align: center;">No content available</div>';
  
  // Clean up the HTML - remove body tags if present
  const cleanHtml = safeHtml
    .replace(/^\s*<body[^>]*>/i, '')
    .replace(/<\/body>\s*$/i, '');

  return (
    <div 
      className="user-page-content"
      style={{
        background: '#ffffff',
        color: '#1f2937',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        lineHeight: 1.5,
      }}
    >
      {/* Inject the page CSS */}
      {css && (
        <style 
          dangerouslySetInnerHTML={{ 
            __html: `
              .user-page-content * {
                box-sizing: border-box;
              }
              .user-page-content img {
                max-width: 100%;
                height: auto;
              }
              .user-page-content a {
                color: inherit;
                text-decoration: none;
              }
              ${css}
            ` 
          }} 
        />
      )}
      
      {/* Render the HTML content */}
      <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </div>
  );
}
