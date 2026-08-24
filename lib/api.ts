const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://clinichub-backend-1.onrender.com';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vl_token');
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('vl_token', token);
  } else {
    localStorage.removeItem('vl_token');
  }
}

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiCall(
  endpoint: string,
  options: ApiOptions = {}
): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    setToken(null);
    throw new Error('Unauthorized - please log in again');
  }

  if (response.status === 403) {
    throw new Error('Forbidden - access denied');
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth endpoints
export const authAPI = {
  login: (username: string, password: string) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => apiCall('/api/auth/logout', { method: 'POST' }),
};

// Policies endpoints
export const policiesAPI = {
  getAll: () => apiCall('/api/policies'),
  getOne: (id: string) => apiCall(`/api/policies/${id}`),
  create: (data: any) =>
    apiCall('/api/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/api/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/api/policies/${id}`, { method: 'DELETE' }),
};

// Boarding endpoints
export const boardingAPI = {
  getAll: () => apiCall('/api/boarding'),
  getOne: (id: string) => apiCall(`/api/boarding/${id}`),
  create: (data: any) =>
    apiCall('/api/boarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/api/boarding/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/api/boarding/${id}`, { method: 'DELETE' }),
};

// SMS Templates endpoints
export const smsAPI = {
  getAll: () => apiCall('/api/sms-templates'),
  create: (name: string, content: string) =>
    apiCall('/api/sms-templates', {
      method: 'POST',
      body: JSON.stringify({ name, content }),
    }),
  update: (id: string, name: string, content: string) =>
    apiCall(`/api/sms-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, content }),
    }),
  delete: (id: string) =>
    apiCall(`/api/sms-templates/${id}`, { method: 'DELETE' }),
};

// Custom Tabs endpoints
export const tabsAPI = {
  getAll: () => apiCall('/api/custom-tabs'),
  getOne: (id: string) => apiCall(`/api/custom-tabs/${id}`),
  create: (data: any) =>
    apiCall('/api/custom-tabs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/api/custom-tabs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/api/custom-tabs/${id}`, { method: 'DELETE' }),
};
