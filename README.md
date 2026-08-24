# Ajaia Docs

A lightweight collaborative document editor inspired by Google Docs.

This project was built as part of the AI-Native Full Stack Developer assignment, with a focus on delivering a coherent and working product slice within the 4–6 hour timebox.

The application supports document creation, rich-text editing, persistence, and document sharing between users.

---

## Live Demo

**Live Application:** `https://ajaia-docs-h1fo.vercel.app/`

**Backend API:** [`ADD_LIVE_BACKEND_URL](https://ajaia-docs-1-z5c9.onrender.com/health)`

**API Documentation:** `[ADD_LIVE_BACKEND_URL/docs](https://ajaia-docs-1-z5c9.onrender.com/docs)`

---

## Demo Users

Authentication is intentionally simplified for this assignment.

The application uses seeded users that can be selected from the UI.

| Name | Email | User ID |
|---|---|---:|
| Aryaman Sharma | aryaman@example.com | 1 |
| Priya Mehta | priya@example.com | 2 |

These accounts are provided only to demonstrate the document ownership and sharing flows.

---

# Features

## 1. Document Creation

Users can:

- Create a new document
- Open an existing document
- Rename a document
- Delete a document
- Return to the document list
- Reopen previously saved documents

Documents remain available after refreshing the browser.

---

## 2. Rich-Text Editing

The document editor supports:

- Bold
- Italic
- Underline
- Heading 1
- Heading 2
- Bulleted lists
- Numbered lists

Document content is stored as structured editor data so that formatting is preserved when the document is reopened.

---

## 3. Document Sharing

A document owner can share a document with another seeded user.

The application supports:

- Document ownership
- Granting another user access
- Viewing shared documents
- Distinguishing owned and shared documents in the UI
- Opening shared documents

For example:

```text
Aryaman Sharma
    │
    └── owns ──> Document
                     │
                     └── shared with ──> Priya Mehta
4. Persistence

Documents and sharing information are persisted in the backend database.

The application therefore maintains:

Document title
Document content
Document formatting
Document ownership
Sharing relationships
Created/updated timestamps

Refreshing the browser does not remove saved documents.

Tech Stack
Frontend
React
Vite
JavaScript
Tiptap
CSS
Backend
Python
FastAPI
SQLAlchemy
SQLite
Uvicorn
Testing
Pytest
FastAPI TestClient
Project Structure
ajaia-docs/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   └── main.py
│   │
│   ├── api/
│   │   ├── documents.py
│   │   ├── sharing.py
│   │   └── users.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── document.py
│   │   └── share.py
│   │
│   ├── schemas/
│   │   ├── document.py
│   │   └── share.py
│   │
│   ├── tests/
│   │   └── test_documents.py
│   │
│   ├── database.py
│   ├── seed.py
│   └── requirements.txt
│
├── README.md
├── ARCHITECTURE.md
├── AI_WORKFLOW.md
├── SUBMISSION.md
└── WALKTHROUGH_URL.txt
Local Setup
Prerequisites

Install:

Node.js 22+
npm
Python 3.11+
Git
1. Clone the Repository
git clone <REPOSITORY_URL>
cd ajaia-docs
2. Start the Backend

Open a terminal and navigate to the backend:

cd backend

Create a Python virtual environment:

python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Seed the demo users:

python seed.py

Start the FastAPI server:

uvicorn app.main:app --reload

The backend will be available at:

http://127.0.0.1:8000

FastAPI Swagger documentation:

http://127.0.0.1:8000/docs
3. Start the Frontend

Open a second terminal:

cd frontend

Install dependencies:

npm install

Start the Vite development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

If port 5173 is already in use, Vite will automatically use another available port.

Recommended Demo Flow

The following flow demonstrates the main functionality of the application.

Step 1 — Select Aryaman Sharma

Select:

Aryaman Sharma

Owned documents should appear in the document list.

Step 2 — Create a Document

Click:

+ New document

A new document should appear.

Step 3 — Edit the Document

Open the document and try:

Normal text
Bold
Italic
Underline
H1
H2
Bulleted list
Numbered list
Step 4 — Rename the Document

Rename the document and navigate back to the document list.

Step 5 — Reopen the Document

Open the renamed document again.

The title, content, and formatting should still be present.

Step 6 — Refresh

Refresh the browser.

The document should still be available.

Step 7 — Share the Document

While logged in as Aryaman Sharma, share the document with:

Priya Mehta
Step 8 — Switch User

Select:

Priya Mehta

The shared document should appear with a:

Shared

indicator.

API Overview

The backend exposes REST APIs for users, documents, and sharing.

Users
Get users
GET /users

Returns the seeded users.

Documents
Get documents
GET /documents?user_id={user_id}

Returns documents owned by or shared with the specified user.

Create document
POST /documents?user_id={user_id}

Example:

{
  "title": "My Document"
}
Get document
GET /documents/{document_id}?user_id={user_id}

Returns the document if the user owns it or has been granted access.

Update document
PATCH /documents/{document_id}?user_id={user_id}

Supports updating document properties such as:

title
content
Delete document
DELETE /documents/{document_id}?user_id={user_id}

Deletes the document if the user has the required access.

Sharing API
Share a document
POST /documents/{document_id}/shares?user_id={owner_id}

Example request:

{
  "user_id": 2
}

This grants user 2 access to the specified document.

The backend validates the sharing operation and prevents invalid cases such as sharing a document with its owner.

Data Model

The application uses three primary entities:

User
 │
 ├──────── owns ────────> Document
 │                            │
 │                            │
 └──── receives share ──> DocumentShare
                              │
                              └──> Document
User

Represents a user of the application.

Document

Stores:

title
structured content
owner
creation timestamp
update timestamp
DocumentShare

Represents access granted by a document owner to another user.

Persistence

SQLite is used for persistence.

SQLAlchemy provides the database abstraction layer.

The document editor stores structured content rather than only plain text. This allows rich-text formatting to survive saving and reopening the document.

For this assignment, SQLite was chosen because it provides persistent storage without requiring an external database service.

For a production deployment, the same architecture could be migrated to PostgreSQL.

Access Control

Authentication is intentionally simplified for the assignment.

The selected user in the frontend represents the current user.

The backend still performs authorization checks for document operations.

A user can access a document when:

They are the document owner, or
A DocumentShare record grants them access.

The sharing endpoint additionally ensures that:

The document exists.
The requesting user owns the document.
The target user exists.
The owner cannot share the document with themselves.
Duplicate sharing relationships are rejected.

This provides a functional sharing model without spending the assignment time on production authentication infrastructure.

File Upload

File upload/import was intentionally deprioritized in the final implementation to ensure the core document editing, persistence, and sharing flows were complete and reliable within the assignment timebox.

With additional time, the next implementation would support importing .txt and .md files into editable documents.

This is an intentional scope decision rather than an incomplete core flow.

Validation and Error Handling

The backend includes validation and appropriate HTTP error responses for cases such as:

User not found
Document not found
Unauthorized document access
Invalid sharing target
Sharing a document with yourself
Duplicate document shares

The frontend handles API failures and provides user-facing feedback where appropriate.

Automated Testing

The backend includes automated testing using Pytest and FastAPI's TestClient.

Run:

cd backend
pytest

The current test suite verifies the core document creation and retrieval flow.

Example:

collected 1 item

tests/test_documents.py . [100%]

1 passed

The test confirms that:

A document can be created through the API.
The created document can subsequently be retrieved.
Engineering Decisions
Why React?

React provides a straightforward component model for building the document list, editor, sharing UI, and user selection flow.

It also provides enough flexibility to keep the frontend intentionally lightweight.

Why FastAPI?

FastAPI provides:

Simple REST API development
Automatic OpenAPI documentation
Request validation
Clear route organization
Easy integration with SQLAlchemy

The automatically generated Swagger UI also makes the backend easy for reviewers to inspect.

Why Tiptap?

Rich-text editing is one of the most important parts of this assignment.

Rather than implementing formatting behavior manually with contenteditable, Tiptap provides a structured editor model and extensions for common document formatting.

This allowed development time to be focused on the complete product flow.

Why SQLite?

The assignment requires persistence but does not require production-scale database infrastructure.

SQLite provides:

Persistent storage
Zero external database setup
Simple local development
Easy SQLAlchemy integration
A clear migration path to PostgreSQL
Scope and Prioritization

The assignment had a strict 4–6 hour timebox.

The implementation prioritized the following:

Document creation
Rich-text editing
Document persistence
Rename and reopen flows
Sharing
Owned/shared document distinction
Backend validation
Automated testing
Clear project structure

The following features were intentionally deprioritized:

Real-time collaboration
Production authentication
Comments
Suggestion mode
Version history
Advanced permissions
Offline editing
Complex document conversion
Enterprise-grade access control

The goal was to provide a small but coherent product slice rather than a shallow implementation of every Google Docs feature.

Future Improvements

With another 2–4 hours, I would prioritize:

1. File Import

Add .txt, .md, and potentially .docx import into editable documents.

2. Better Authentication

Replace the seeded-user selector with real authentication and session management.

3. Improved Sharing UI

Add a dedicated sharing dialog showing:

Document owner
Current collaborators
Access permissions
Remove access
4. Autosave State

Improve the editor experience with explicit save states:

Saving...
Saved
Unable to save
5. Real-Time Collaboration

Add WebSocket-based collaboration and eventually a CRDT-based synchronization model.

AI-Assisted Development

AI tools were used throughout development as engineering accelerators.

AI was used for:

Exploring architecture and implementation approaches
Generating initial boilerplate
Debugging implementation issues
Reviewing API structure
Generating test scaffolding
Improving documentation
Iterating on frontend UX

AI-generated output was reviewed, tested, and modified rather than accepted blindly.

Correctness was verified through:

Running the backend locally
Testing API endpoints through FastAPI Swagger
Testing the frontend manually
Verifying document persistence after refresh
Verifying the sharing workflow with both seeded users
Running automated tests with Pytest

More detail is provided in:

AI_WORKFLOW.md
Deliverables

The submission folder contains:

Source Code
README.md
ARCHITECTURE.md
AI_WORKFLOW.md
SUBMISSION.md
WALKTHROUGH_URL.txt

The live deployment URL and walkthrough video URL should be added before submission.

Known Limitations

This is an intentionally scoped assignment implementation rather than a production-ready collaborative document platform.

Current limitations include:

Authentication is simulated.
SQLite is used for persistence.
Collaboration is not real-time.
Sharing uses seeded users.
File import is not included in the final implementation.
Rich-text functionality is limited to the requested core formatting features.

These limitations were deliberate tradeoffs made to prioritize the most important end-to-end product flows within the assignment timebox.

License

This project was created as part of a technical assignment for evaluation purposes.
