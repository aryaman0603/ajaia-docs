from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_create_and_get_document():
    # Create a document as Aryaman
    create_response = client.post(
        "/documents?user_id=1",
        json={
            "title": "Automated Test Document",
        },
    )

    assert create_response.status_code == 201

    created_document = create_response.json()

    assert created_document["title"] == "Automated Test Document"
    assert created_document["owner_id"] == 1
    assert created_document["content"] is not None

    document_id = created_document["id"]

    # Fetch the document again
    get_response = client.get(
        f"/documents/{document_id}?user_id=1"
    )

    assert get_response.status_code == 200

    fetched_document = get_response.json()

    # Verify persistence
    assert fetched_document["id"] == document_id
    assert fetched_document["title"] == "Automated Test Document"
    assert fetched_document["owner_id"] == 1
    assert fetched_document["content"] == created_document["content"]