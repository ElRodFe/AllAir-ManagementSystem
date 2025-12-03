import api from "../api/axios";

export async function getClients() {
  const res = await api.get("/clients/");
  return res.data;
}

export async function getClientById(id) {
  const res = await api.get(`/clients/${id}`);
  return res.data;
}

export async function createClient(data) {
  const res = await api.post("/clients/", data);
  return res.data;
}

export async function updateClient(id, data) {
  const res = await api.put(`/clients/${id}`, data);
  return res.data;
}

export async function deleteClient(id) {
  const res = await api.delete(`/clients/${id}`);
  return true;
}
