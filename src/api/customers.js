// src/api/customers.js
import api from "./index";

export const getCustomers = () => api.get("/customers");
export const createCustomer = (data) => api.post("/customers", data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

export const uploadCustomersCSV = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/customers/upload-csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
