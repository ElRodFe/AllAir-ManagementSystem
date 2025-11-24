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
// DATA FETCHING FUNCTIONS
// ============================================

export async function getClients() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_URL}/clients/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (res.status === 401) {
    logout();
    throw new Error("Authentication failed");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch clients: ${res.status}`);
  }

  return res.json();
}

export async function getWorkOrders() {
  
  const token = getToken();
  
  const res = await fetch(`${API_URL}/work-orders/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  
  if (res.status === 401) {
    localStorage.removeItem("access_token");
    throw new Error("Not authenticated");
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Error response:", errorText);
    throw new Error(`Error obtaining orders: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data;
}