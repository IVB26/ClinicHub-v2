'use client';

import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: string;
}

export function QuillEditor({
  value,
  onChange,
  placeholder = 'Enter content...',
  disabled = false,
  height = '300px',
}: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize Quill
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ header: 1 }, { header: 2 }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ color: [] }, { background: [] }],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
      },
    });

    // Set initial content
    if (value) {
      quillRef.current.root.innerHTML = value;
    }

    // Track content changes
    quillRef.current.on('text-change', () => {
      const html = quillRef.current?.root.innerHTML || '';
      onChange(html);
    });

    // Custom image handler
    const imageHandler = () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', '.jpg,.jpeg,.png,.gif,.webp,.svg');
      input.click();

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;

        const validMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
        ];
        const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        const isValidMime = validMimes.includes(file.type);
        const isValidExt = validExts.includes(fileExt || '');

        if (isValidMime || isValidExt) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const range = quillRef.current?.getSelection();
            if (range) {
              quillRef.current?.insertEmbed(range.index, 'image', dataUrl);
            }
          };
          reader.readAsDataURL(file);
        } else {
          alert(
            'Please upload a valid image format: JPG, PNG, GIF, WebP, or SVG'
          );
        }
      };
    };

    // Custom video handler
    const videoHandler = () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', '.mp4,.webm,.ogg');
      input.click();

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;

        const validMimes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (validMimes.includes(file.type)) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const range = quillRef.current?.getSelection();
            if (range) {
              quillRef.current?.insertEmbed(range.index, 'video', dataUrl);
            }
          };
          reader.readAsDataURL(file);
        } else {
          alert('Please upload a valid video format: MP4, WebM, or Ogg');
        }
      };
    };

    // Register custom handlers
    const toolbar = quillRef.current.getModule('toolbar');
    toolbar.addHandler('image', imageHandler);
    toolbar.addHandler('video', videoHandler);

    setIsReady(true);

    return () => {
      // Cleanup on unmount
      if (quillRef.current) {
        quillRef.current.off('text-change');
        quillRef.current = null;
      }
    };
  }, []);

  // Update content when value prop changes externally
  useEffect(() => {
    if (isReady && quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value, isReady]);

  return (
    <div
      ref={containerRef}
      className="quill-editor-wrapper"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        backgroundColor: disabled ? '#f3f4f6' : 'white',
      }}
    >
      <div
        ref={editorRef}
        style={{
          height,
          backgroundColor: disabled ? '#f3f4f6' : 'white',
        }}
      />
      <style jsx>{`
        :global(.quill-editor-wrapper .ql-toolbar) {
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        :global(.quill-editor-wrapper .ql-container) {
          border: none;
          font-size: 14px;
        }

        :global(.quill-editor-wrapper .ql-editor) {
          min-height: 250px;
          padding: 12px;
        }

        :global(.quill-editor-wrapper .ql-editor img) {
          max-width: 100%;
          height: auto;
        }

        :global(.quill-editor-wrapper .ql-editor video) {
          max-width: 100%;
          height: auto;
        }

        :global(.quill-editor-wrapper.disabled .ql-toolbar) {
          background: #f3f4f6;
          opacity: 0.5;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
