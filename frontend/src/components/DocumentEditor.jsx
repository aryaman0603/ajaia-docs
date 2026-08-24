import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

const API_URL = "http://127.0.0.1:8000";

function ToolbarButton({ onClick, active, children }) {
  return (
    <button
      type="button"
      className={`toolbar-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function DocumentEditor({
  document,
  userId,
  onBack,
  onDocumentUpdated,
}) {
  const [title, setTitle] = useState(document.title);
  const [saveStatus, setSaveStatus] = useState("Saved");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],

    content: document.content
      ? JSON.parse(document.content)
      : {
          type: "doc",
          content: [],
        },

    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },

    onUpdate: ({ editor }) => {
      saveDocument(editor.getJSON(), title);
    },
  });

  useEffect(() => {
    setTitle(document.title);
  }, [document.id]);

  async function saveDocument(content, currentTitle = title) {
    if (!editor) {
      return;
    }

    setSaveStatus("Saving...");

    try {
      const response = await fetch(
        `${API_URL}/documents/${document.id}?user_id=${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: currentTitle,
            content: JSON.stringify(content),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save document");
      }

      const updatedDocument = await response.json();

      setSaveStatus("Saved");

      if (onDocumentUpdated) {
        onDocumentUpdated(updatedDocument);
      }
    } catch (error) {
      console.error(error);
      setSaveStatus("Unable to save");
    }
  }

  async function handleTitleBlur() {
    if (title.trim() === "") {
      setTitle(document.title);
      return;
    }

    if (title === document.title) {
      return;
    }

    try {
      setSaveStatus("Saving...");

      const response = await fetch(
        `${API_URL}/documents/${document.id}?user_id=${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to rename document");
      }

      const updatedDocument = await response.json();

      setTitle(updatedDocument.title);
      setSaveStatus("Saved");

      if (onDocumentUpdated) {
        onDocumentUpdated(updatedDocument);
      }
    } catch (error) {
      console.error(error);
      setSaveStatus("Unable to save");
    }
  }

  if (!editor) {
    return (
      <div className="editor-loading">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div className="editor-header-left">
          <button
            type="button"
            className="back-button"
            onClick={onBack}
          >
            ←
          </button>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleTitleBlur}
            className="document-title-input"
            aria-label="Document title"
          />
        </div>

        <div className="save-status">
          {saveStatus}
        </div>
      </header>

      <div className="editor-toolbar">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </ToolbarButton>

        <div className="toolbar-divider" />

        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>

        <div className="toolbar-divider" />

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          • List
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          1. List
        </ToolbarButton>
      </div>

      <main className="editor-container">
        <div className="editor-paper">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}