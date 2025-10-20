// src/api/spares.js
import api from "./index";

export const getSpares = () => api.get("/spares");
export const getSpare = (id) => api.get(`/spares/${id}`);
export const createSpare = (data) => api.post("/spares", data);
export const updateSpare = (id, data) => api.put(`/spares/${id}`, data);
export const deleteSpare = (id) => api.delete(`/spares/${id}`);

export const uploadSparesCSV = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/spares/upload-csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
