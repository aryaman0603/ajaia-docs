const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="toolbar">
      <button
        type="button"
        className={editor.isActive("bold") ? "active" : ""}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </button>

      <button
        type="button"
        className={editor.isActive("italic") ? "active" : ""}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </button>

      <button
        type="button"
        className={editor.isActive("underline") ? "active" : ""}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
      >
        H1
      </button>

      <button
        type="button"
        className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        H2
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        className={editor.isActive("bulletList") ? "active" : ""}
        onClick={() =>
          editor.chain().focus().toggleBulletList().run()
        }
      >
        • List
      </button>

      <button
        type="button"
        className={editor.isActive("orderedList") ? "active" : ""}
        onClick={() =>
          editor.chain().focus().toggleOrderedList().run()
        }
      >
        1. List
      </button>
    </div>
  );
};

export default Toolbar;