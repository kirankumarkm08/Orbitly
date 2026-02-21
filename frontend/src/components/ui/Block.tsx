"use client";

import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface BlockProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  height?: number;
}

export function Block({ content, onChange, placeholder = 'Start typing...', className = '', height = 400 }: BlockProps) {
  const [editorContent, setEditorContent] = useState(content);

  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content);
    }
  }, [content, editorContent]);

  const handleEditorChange = (value: string) => {
    setEditorContent(value);
    onChange(value);
  };

  return (
    <div className={`block-editor ${className}`}>
      <Editor
        initialValue={editorContent}
        init={{
          height,
          menubar: false,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount',
          ],
          toolbar:
            'undo redo | formatselect | ' +
            'bold italic backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder,
        }}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
}
