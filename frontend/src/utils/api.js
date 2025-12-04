const API_URL = "http://localhost:8000";

// ============================================
// AUTH FUNCTIONS
// ============================================

function getToken() {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export function isAuthenticated() {
  return !!getToken();
}

export async function loginUser(credentials) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Login failed: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return data;
}

export function logout() {
  localStorage.removeItem("access_token");
}

// ============================================
// CLIENTS
// ============================================

export async function getClients() {
  const res = await fetch(`${API_URL}/clients/`, {
    headers: authHeaders()
  });

  if (res.status === 401) {
    logout();
    throw new Error("Authentication failed");
  }

  if (!res.ok) throw new Error(`Failed to fetch clients: ${res.status}`);

  return res.json();
}

export async function getClientById(id) {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    headers: authHeaders()
  });

  if (res.status === 401) {
    logout();
    throw new Error("Authentication failed");
  }

  if (!res.ok) throw new Error(`Failed to fetch client ${id}: ${res.status}`);

  return res.json();
}

export async function createClient(body) {
  const res = await fetch(`${API_URL}/clients/`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    logout();
    throw new Error("Authentication failed");
  }

  if (!res.ok) throw new Error("Failed to create client");

  return res.json();
}

export async function updateClient(id, body) {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    logout();
    throw new Error("Authentication failed");
  }

  if (!res.ok) throw new Error("Failed to update client");

  return res.json();
}


// ============================================
// WORK ORDERS
// ============================================

export async function createWorkOrder(data) {
  const res = await fetch(`${API_URL}/work-orders/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error creating work order");

  return res.json();
}

export async function getWorkOrders() {
  const res = await fetch(`${API_URL}/work-orders/`, {
    headers: authHeaders()
  });

  if (res.status === 401) {
    logout();
    throw new Error("Not authenticated");
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Error response:", errorText);
    throw new Error(`Error obtaining orders: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function getWorkOrderById(id) {
  const res = await fetch(`${API_URL}/work-orders/${id}`, {
    headers: authHeaders()
  });

  if (res.status === 401) {
    logout();
    throw new Error("Not authenticated");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch work order ${id}: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function editWorkOrder(id, data) {
  const res = await fetch(`${API_URL}/work-orders/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error editing work order ${id}: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function deleteWorkOrder(id) {
  const response = await fetch(`${API_URL}/work-orders/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete work order");
  }

  return true;
}

// ============================================
// VEHICLES
// ============================================

export async function getVehicles() {
  const res = await api.get("/vehicles");
  return res.data;
}

export async function getVehicle(id) {
  const res = await api.get(`/vehicles/${id}`);
  return res.data;
}

export async function createVehicle(data) {
  const res = await api.post("/vehicles", data);
  return res.data;
}

export async function updateVehicle(id, data) {
  const res = await api.put(`/vehicles/${id}`, data);
  return res.data;
}

export async function deleteVehicle(id) {
  const res = await api.delete(`/vehicles/${id}`);
  return res.data;
}