// src/api/users.js
import api from "./index";

export const getMe = () => api.get("/users/me");
export const getUsers = () => api.get("/users");
export const createUser = (data) => api.post("/users/signup", data);
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
