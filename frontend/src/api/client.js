import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getDocuments = async (userId) => {
  const response = await api.get("/documents", {
    params: { user_id: userId },
  });

  return response.data;
};

export const getDocument = async (documentId, userId) => {
  const response = await api.get(`/documents/${documentId}`, {
    params: { user_id: userId },
  });

  return response.data;
};

export const createDocument = async (userId, title = "Untitled Document") => {
  const response = await api.post(
    "/documents",
    { title },
    {
      params: { user_id: userId },
    }
  );

  return response.data;
};

export const updateDocument = async (documentId, userId, data) => {
  const response = await api.patch(`/documents/${documentId}`, data, {
    params: { user_id: userId },
  });

  return response.data;
};

export const shareDocument = async (documentId, ownerId, userId) => {
  const response = await api.post(
    `/documents/${documentId}/shares`,
    { user_id: userId },
    {
      params: { user_id: ownerId },
    }
  );

  return response.data;
};

export default api;