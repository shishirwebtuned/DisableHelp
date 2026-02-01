'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from '@/lib/utils';


const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3,4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'color', 'background',
    'link'
  ];

    return (
      <div className={cn('h-full rounded-md overflow-hidden border', className)}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="h-[calc(100%-42px)] bg-transparent text-inherit"
        />
      </div>
    );
};

export default RichTextEditor;

