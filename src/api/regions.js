import api from "./index";
export const getRegions = () => api.get("/customers/region");
export const createRegion = (payload) =>
  api.post("/customers/createRegion", payload);
// // ✅ Bulk upload (if you later add this to backend)
// export const uploadRegionsCSV = async (formData, token) => {
//   return fetch(`${import.meta.env.VITE_API_URL}/customers/upload-csv`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     body: formData,
//   });
// };
