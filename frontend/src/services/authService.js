import api from "../api/axios";

export async function login(username, password) {
  const response = await api.post("/auth/login", {
    username,
    password
  });

  return response.data;
}

export function saveAuthData(data) {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}
