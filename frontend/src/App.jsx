import { useEffect, useRef, useState } from "react";
import DocumentEditor from "./components/DocumentEditor";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(1);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadDocuments(selectedUserId);
    }
  }, [selectedUserId]);

  async function loadUsers() {
    try {
      const response = await fetch(`${API_URL}/users`);

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load users.");
    }
  }

  async function loadDocuments(userId) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/documents?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load documents");
      }

      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }

  async function createDocument() {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/documents?user_id=${selectedUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Untitled Document",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      const newDocument = await response.json();

      setDocuments((currentDocuments) => [
        newDocument,
        ...currentDocuments,
      ]);

      setSelectedDocument(newDocument);
    } catch (error) {
      console.error(error);
      setError("Unable to create document.");
    }
  }

  async function importDocument(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const extension = file.name
      .toLowerCase()
      .split(".")
      .pop();

    if (!["txt", "md"].includes(extension)) {
      setError("Only .txt and .md files are supported.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    try {
      setError("");
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/documents/import?user_id=${selectedUserId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail || "Failed to import document"
        );
      }

      const importedDocument = await response.json();

      setDocuments((currentDocuments) => [
        importedDocument,
        ...currentDocuments,
      ]);

      setSelectedDocument(importedDocument);
    } catch (error) {
      console.error(error);
      setError(
        error.message || "Unable to import document."
      );
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  async function openDocument(documentId) {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/documents/${documentId}?user_id=${selectedUserId}`
      );

      if (!response.ok) {
        throw new Error("Failed to open document");
      }

      const data = await response.json();

      setSelectedDocument(data);
    } catch (error) {
      console.error(error);
      setError("Unable to open document.");
    }
  }

  function handleDocumentUpdated(updatedDocument) {
    setSelectedDocument(updatedDocument);

    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === updatedDocument.id
          ? updatedDocument
          : document
      )
    );
  }

  function handleUserChange(event) {
    const userId = Number(event.target.value);

    setSelectedUserId(userId);
    setSelectedDocument(null);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  if (selectedDocument) {
    return (
      <DocumentEditor
        document={selectedDocument}
        userId={selectedUserId}
        onBack={() => setSelectedDocument(null)}
        onDocumentUpdated={handleDocumentUpdated}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Ajaia Docs</h1>

          <p className="subtitle">
            Simple collaborative documents
          </p>
        </div>

        <div className="user-selector">
          <label htmlFor="user-select">
            Signed in as
          </label>

          <select
            id="user-select"
            value={selectedUserId}
            onChange={handleUserChange}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="documents-page">
        <div className="documents-header">
          <div>
            <h2>Your documents</h2>

            <p>
              Documents you own or that have been shared with you.
            </p>
          </div>

          <div className="document-actions">
            <button
              type="button"
              className="import-document-button"
              onClick={openFilePicker}
            >
              ↑ Import file
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              onChange={importDocument}
              hidden
            />

            <button
              type="button"
              className="new-document-button"
              onClick={createDocument}
            >
              + New document
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <h3>No documents yet</h3>

            <p>
              Create your first document to get started.
            </p>
          </div>
        ) : (
          <div className="document-grid">
            {documents.map((document) => {
              const isOwned =
                document.owner_id === selectedUserId;

              return (
                <button
                  type="button"
                  className="document-card"
                  key={document.id}
                  onClick={() =>
                    openDocument(document.id)
                  }
                >
                  <div className="document-card-icon">
                    📄
                  </div>

                  <div className="document-card-content">
                    <h3>{document.title}</h3>

                    <div className="document-card-meta">
                      <span>
                        {isOwned ? "Owned" : "Shared"}
                      </span>

                      <span>•</span>

                      <span>
                        {new Date(
                          document.updated_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;