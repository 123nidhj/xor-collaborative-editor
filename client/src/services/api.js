const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      // Clear token on authentication failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  register: (body) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),

  login: (body) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Documents
  getDocuments: () =>
    fetch(`${API_BASE}/documents`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getDocument: (id) =>
    fetch(`${API_BASE}/documents/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  createDocument: (data) =>
    fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateDocument: (id, data) =>
    fetch(`${API_BASE}/documents/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteDocument: (id) =>
    fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  shareDocument: (id, { email, role }) =>
    fetch(`${API_BASE}/documents/${id}/share`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, role }),
    }).then(handleResponse),

  getHistory: (id) =>
    fetch(`${API_BASE}/documents/${id}/history`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Health
  checkHealth: () =>
    fetch(`${API_BASE}/health`).then(handleResponse),
};
