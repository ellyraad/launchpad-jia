"use client";

import React, { useRef, useEffect } from "react";

import styles from "@/lib/styles/commonV2/richTextEditor.module.scss";

export default function RichTextEditor({setText, text, invalid = false}) {
  const descriptionEditorRef = useRef(null);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    descriptionEditorRef.current?.focus();
  };

  const handleDescriptionChange = () => {
    if (descriptionEditorRef.current) {
      setText(descriptionEditorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain');

    // Insert the plain text at cursor position
    document.execCommand('insertText', false, text);

    // Update the state
    handleDescriptionChange();
  };

  // Handle placeholder for contenteditable div
  useEffect(() => {
    const editor = descriptionEditorRef.current;
    if (editor) {
      const handleFocus = () => {
        if (editor.innerHTML === '' || editor.innerHTML === '<br>') {
          editor.innerHTML = '';
        }
      };

      const handleBlur = () => {
        if (editor.innerHTML === '' || editor.innerHTML === '<br>') {
          editor.innerHTML = '';
        }
      };

      editor.addEventListener('focus', handleFocus);
      editor.addEventListener('blur', handleBlur);

      return () => {
        editor.removeEventListener('focus', handleFocus);
        editor.removeEventListener('blur', handleBlur);
      };
    }
  }, []);


  useEffect(() => {
    if (descriptionEditorRef.current && !descriptionEditorRef.current.innerHTML && text) {
      descriptionEditorRef.current.innerHTML = text;
    }
  }, []);

  return (
    <div style={{ border: `1px solid ${invalid ? '#FDA29B' : '#e9eaeb'}`, borderRadius: "8px" }}>
      <div
        ref={descriptionEditorRef}
        contentEditable={true}
        className={`${styles.editorForm}`}
        onInput={handleDescriptionChange}
        onBlur={handleDescriptionChange}
        onPaste={handlePaste}
        data-placeholder="Enter job description..."
      ></div>

      {/* Rich Text Editor Toolbar */}
      <div className={styles.editorToolbar}>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => formatText('bold')}
          title="Bold"
        >
          <i className="la la-bold"></i>
        </button>

        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => formatText('italic')}
          title="Italic"
        >
          <i className="la la-italic"></i>
        </button>

        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => formatText('underline')}
          title="Underline"
        >
          <i className="la la-underline"></i>
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => formatText('strikeThrough')}
          title="Strikethrough"
        >
          <i className="la la-strikethrough"></i>
        </button>

        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => formatText('insertOrderedList')}
          title="Numbered List"
        >
          <i className="la la-list-ol"></i>
        </button>

        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => formatText('insertUnorderedList')}
          title="Bullet List"
        >
          <i className="la la-list-ul"></i>
        </button>
      </div>

      <style jsx>
        {`
          [data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #6c757d;
            pointer-events: none;
            position: absolute;
            top: 12px;
            left: 12px;
          }
      `}
      </style>
    </div>
  )
}
