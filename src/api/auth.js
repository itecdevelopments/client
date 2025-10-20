import api from "./index";

export const signup = (data) => api.post("/users/signup", data);

export const login = async (data) => {
  const res = await api.post("/users/login", data);
  const user = res.data.data?.user;

  console.log("🔐 Login response:", res.data);

  if (res.data.token && user) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("userID", user._id);
    localStorage.setItem("userName", user.name || "");

    if (user.region && typeof user.region === "object") {
      localStorage.setItem("regionID", user.region._id);
      localStorage.setItem("regionName", user.region.name);
      localStorage.setItem("regionCode", user.region.code);
    } else {
      localStorage.setItem("regionID", user.region);
    }
  }

  return res.data;
};

export const logout = async () => {
  await api.get("/users/logout");
  [
    "token",
    "role",
    "userID",
    "userName",
    "regionID",
    "regionName",
    "regionCode",
  ].forEach((key) => localStorage.removeItem(key));
};

export const updatePassword = (data) =>
  api.patch("/users/updateMyPassword", data);

export const getUserRole = () => localStorage.getItem("role");
