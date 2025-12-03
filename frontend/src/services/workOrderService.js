import api from "../api/axios";

export async function getWorkOrders() {
  const res = await api.get("/work-orders/");
  return res.data;
}

export async function getWorkOrderById(id) {
  const res = await api.get(`/work-orders/${id}`);
  return res.data;
}

export async function createWorkOrder(data) {
  const res = await api.post("/work-orders/", data);
  return res.data;
}

export async function updateWorkOrder(id, data) {
  const res = await api.put(`/work-orders/${id}`, data);
  return res.data;
}

export async function deleteWorkOrder(id) {
  await api.delete(`/work-orders/${id}`);
  return true;
}
