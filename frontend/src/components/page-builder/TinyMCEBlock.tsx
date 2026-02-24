'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List, 
  ListOrdered,
  Link, 
  Image,
  Code,
  Quote,
  Minus,
  Undo,
  Redo,
  Type,
  Palette,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TinyMCEBlockProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function TinyMCEBlock({ 
  initialContent = '', 
  onChange,
  placeholder = 'Start typing your content...',
  editable = true,
  className
}: TinyMCEBlockProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleEditorChange = (value: string) => {
    setContent(value);
    onChange?.(value);
  };

  const tools = [
    { icon: Undo, label: 'Undo', action: 'undo' },
    { icon: Redo, label: 'Redo', action: 'redo' },
    { type: 'divider' },
    { icon: Bold, label: 'Bold', action: 'bold' },
    { icon: Italic, label: 'Italic', action: 'italic' },
    { icon: Underline, label: 'Underline', action: 'underline' },
    { type: 'divider' },
    { icon: AlignLeft, label: 'Align Left', action: 'alignleft' },
    { icon: AlignCenter, label: 'Align Center', action: 'aligncenter' },
    { icon: AlignRight, label: 'Align Right', action: 'alignright' },
    { type: 'divider' },
    { icon: List, label: 'Bullet List', action: 'bullist' },
    { icon: ListOrdered, label: 'Numbered List', action: 'numlist' },
    { type: 'divider' },
    { icon: Link, label: 'Insert Link', action: 'link' },
    { icon: Image, label: 'Insert Image', action: 'image' },
    { icon: Quote, label: 'Quote', action: 'blockquote' },
    { icon: Code, label: 'Code', action: 'code' },
    { type: 'divider' },
    { icon: Minus, label: 'Horizontal Line', action: 'hr' },
  ];

  const execCommand = (action: string) => {
    if (action === 'link') {
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    } else if (action === 'image') {
      const url = prompt('Enter image URL:');
      if (url) {
        document.execCommand('insertImage', false, url);
      }
    } else {
      document.execCommand(action, false);
    }
  };

  return (
    <div className={cn("tiny-mce-block rounded-xl border border-border overflow-hidden bg-white shadow-sm", className)}>
      {/* Toolbar */}
      {showToolbar && editable && (
        <div className="toolbar-wrapper border-b border-border bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-1 p-2 overflow-x-auto custom-scrollbar">
            {tools.map((tool, index) => (
              tool.type === 'divider' ? (
                <div key={index} className="w-px h-6 bg-border mx-1" />
              ) : (
                <button
                  key={index}
                  onClick={() => execCommand(tool.action || '')}
                  className="toolbar-btn p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                  title={tool.label}
                >
                  {tool.icon && <tool.icon className="w-4 h-4 text-gray-600 group-hover:text-primary" />}
                </button>
              )
            ))}
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2 px-3 pb-2">
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-primary rounded hover:bg-primary/5 transition-all">
              <Type className="w-3 h-3" />
              <span>Heading 1</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-primary rounded hover:bg-primary/5 transition-all">
              <Palette className="w-3 h-3" />
              <span>Text Color</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div 
        className={cn(
          "editor-content min-h-[200px] p-4",
          !isEditing && !content && "bg-gray-50"
        )}
        onClick={() => editable && setIsEditing(true)}
      >
        {editable ? (
          <div
            contentEditable
            className="prose prose-sm max-w-none focus:outline-none"
            dangerouslySetInnerHTML={{ __html: content || `<p class='text-gray-400'>${placeholder}</p>` }}
            onBlur={(e) => {
              setIsEditing(false);
              handleEditorChange(e.currentTarget.innerHTML);
            }}
            onInput={(e) => handleEditorChange(e.currentTarget.innerHTML)}
          />
        ) : (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content || `<p class='text-gray-400'>${placeholder}</p>` }}
          />
        )}
      </div>

      {/* Status Bar */}
      {editable && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-border text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full",
              isEditing ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
            )}>
              {isEditing ? <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> : null}
              {isEditing ? 'Editing' : 'View Mode'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>{content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words</span>
            <span>{content.length} characters</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Modern Block Card Wrapper
export function TinyMCEBlockCard({ 
  title, 
  description, 
  icon: Icon,
  onClick,
  variant = 'default'
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: 'default' | 'featured' | 'compact';
}) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300",
        variant === 'featured' && "border-primary bg-primary/5",
        variant === 'compact' && "p-3"
      )}
    >
      <div className={cn(
        "p-6",
        variant === 'compact' && "p-3"
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300",
            variant === 'compact' ? "h-10 w-10" : "h-12 w-12"
          )}>
            {Icon && <Icon className={variant === 'compact' ? "w-5 h-5" : "w-6 h-6"} />}
          </div>
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold text-foreground group-hover:text-primary transition-colors",
              variant === 'compact' ? "text-sm" : "text-lg"
            )}>
              {title}
            </h3>
            {variant !== 'compact' && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TinyMCEBlock;
