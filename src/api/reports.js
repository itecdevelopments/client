// src/api/reports.js
import api from "./index";

export const createServiceReport = (data) => api.post("/reports", data);
export const getAllReports = () => api.get("/reports");
export const getReportById = (id) => api.get(`/reports/${id}`);
