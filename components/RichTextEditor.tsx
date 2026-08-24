'use client';

import { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      isUpdatingRef.current = false;
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleUnorderedList = () => execCommand('insertUnorderedList');
  const handleOrderedList = () => execCommand('insertOrderedList');
  const handleHeading = (level: string) => execCommand('formatBlock', `<${level}>`);
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  };
  const handleRemoveFormat = () => execCommand('removeFormat');

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 p-2 bg-gray-100 rounded-t-lg border border-gray-300">
        {/* Text Format */}
        <div className="flex gap-1 border-r pr-2">
          <button
            onClick={handleBold}
            className="p-2 hover:bg-gray-200 rounded font-bold text-sm"
            title="Bold (Ctrl+B)"
            disabled={disabled}
          >
            B
          </button>
          <button
            onClick={handleItalic}
            className="p-2 hover:bg-gray-200 rounded italic text-sm"
            title="Italic (Ctrl+I)"
            disabled={disabled}
          >
            I
          </button>
          <button
            onClick={handleUnderline}
            className="p-2 hover:bg-gray-200 rounded underline text-sm"
            title="Underline (Ctrl+U)"
            disabled={disabled}
          >
            U
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2">
          <button
            onClick={() => handleHeading('h2')}
            className="px-3 py-2 hover:bg-gray-200 rounded text-sm font-bold"
            title="Heading 2"
            disabled={disabled}
          >
            H2
          </button>
          <button
            onClick={() => handleHeading('h3')}
            className="px-3 py-2 hover:bg-gray-200 rounded text-sm font-bold"
            title="Heading 3"
            disabled={disabled}
          >
            H3
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2">
          <button
            onClick={handleUnorderedList}
            className="p-2 hover:bg-gray-200 rounded text-sm"
            title="Bullet List"
            disabled={disabled}
          >
            •••
          </button>
          <button
            onClick={handleOrderedList}
            className="p-2 hover:bg-gray-200 rounded text-sm"
            title="Numbered List"
            disabled={disabled}
          >
            1.
          </button>
        </div>

        {/* Links */}
        <div className="flex gap-1 border-r pr-2">
          <button
            onClick={handleLink}
            className="px-3 py-2 hover:bg-gray-200 rounded text-sm text-blue-600"
            title="Insert Link"
            disabled={disabled}
          >
            🔗
          </button>
        </div>

        {/* Clear Format */}
        <button
          onClick={handleRemoveFormat}
          className="px-3 py-2 hover:bg-gray-200 rounded text-sm"
          title="Clear Formatting"
          disabled={disabled}
        >
          ✕
        </button>
      </div>

      <div
        ref={editorRef}
        onInput={handleInput}
        contentEditable={!disabled}
        suppressContentEditableWarning
        className="w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
        style={{
          minHeight: '200px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {!value && !disabled && (
          <p className="text-gray-400">{placeholder || 'Start typing...'}</p>
        )}
      </div>
    </div>
  );
}
