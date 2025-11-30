import api from "../api/axios";

export async function getVehicles() {
  const res = await api.get("/vehicles/");
  return res.data;
}

export async function getVehicleById(id) {
  const res = await api.get(`/vehicles/${id}`);
  return res.data;
}

export async function createVehicle(data) {
  const res = await api.post("/vehicles/", data);
  return res.data;
}

export async function updateVehicle(id, data) {
  const res = await api.put(`/vehicles/${id}`, data);
  return res.data;
}

export async function deleteVehicle(id) {
  const res = await api.delete(`/vehicles/${id}`);
  return true;
}
