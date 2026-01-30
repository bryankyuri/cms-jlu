import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const WysiwygEditor = ({ value, onChange, placeholder = "Enter content..." }) => {
  // Configure toolbar - includes basic formatting for product specs
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align',
    'link'
  ];

  return (
    <div className="wysiwyg-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white"
      />
      <style>{`
        .wysiwyg-editor .ql-container {
          min-height: 200px;
          font-size: 14px;
        }
        .wysiwyg-editor .ql-editor {
          min-height: 200px;
        }
      `}</style>
    </div>
  );
};

export default WysiwygEditor;
