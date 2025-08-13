import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
  keyboard: {
    bindings: {
      enter: {
        key: 13,
        handler: function(range: any, context: any) {
          this.quill.insertText(range.index, '\n');
          this.quill.setSelection(range.index + 1);
          return false;
        }
      }
    }
  }
};

const formats = [
  'header', 'bold', 'italic', 'underline',
  'size', 'color', 'background',
  'list', 'bullet', 'align',
  'link'
];

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  return (
    <div className={cn("rich-text-editor [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:leading-relaxed [&_.ql-editor]:p-3", className)}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="quill-editor"
        style={{
          minHeight: '150px'
        }}
      />
    </div>
  );
}