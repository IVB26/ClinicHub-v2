import type { AuthResponse, Policy, ProtocolCategory, ProtocolItem, ProtocolBlock } from './types';

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

export async function apiCall<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
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
  login: (username: string, password: string): Promise<AuthResponse> =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: (): Promise<unknown> => apiCall('/api/auth/logout', { method: 'POST' }),
};

// Policies endpoints
export const policiesAPI = {
  getAll: (): Promise<Policy[]> => apiCall('/api/policies'),
  getOne: (id: string): Promise<Policy> => apiCall(`/api/policies/${id}`),
  create: (data: Record<string, unknown>): Promise<Policy> =>
    apiCall('/api/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>): Promise<Policy> =>
    apiCall(`/api/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<unknown> =>
    apiCall(`/api/policies/${id}`, { method: 'DELETE' }),
};

// Boarding endpoints
export const boardingAPI = {
  getAll: (): Promise<unknown> => apiCall('/api/boarding'),
  getOne: (id: string): Promise<unknown> => apiCall(`/api/boarding/${id}`),
  create: (data: Record<string, unknown>): Promise<unknown> =>
    apiCall('/api/boarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>): Promise<unknown> =>
    apiCall(`/api/boarding/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<unknown> =>
    apiCall(`/api/boarding/${id}`, { method: 'DELETE' }),
};

// SMS Templates endpoints
export const smsAPI = {
  getAll: (): Promise<unknown> => apiCall('/api/sms-templates'),
  create: (name: string, content: string): Promise<unknown> =>
    apiCall('/api/sms-templates', {
      method: 'POST',
      body: JSON.stringify({ name, content }),
    }),
  update: (id: string, name: string, content: string): Promise<unknown> =>
    apiCall(`/api/sms-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, content }),
    }),
  delete: (id: string): Promise<unknown> =>
    apiCall(`/api/sms-templates/${id}`, { method: 'DELETE' }),
};

// Custom Tabs endpoints
export const tabsAPI = {
  getAll: (): Promise<unknown> => apiCall('/api/custom-tabs'),
  getOne: (id: string): Promise<unknown> => apiCall(`/api/custom-tabs/${id}`),
  create: (data: Record<string, unknown>): Promise<unknown> =>
    apiCall('/api/custom-tabs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>): Promise<unknown> =>
    apiCall(`/api/custom-tabs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<unknown> =>
    apiCall(`/api/custom-tabs/${id}`, { method: 'DELETE' }),
};

// Protocols endpoints
export const protocolsAPI = {
  categories: {
    getAll: (): Promise<ProtocolCategory[]> => apiCall('/api/protocols/categories'),
    create: (data: Record<string, unknown>): Promise<ProtocolCategory> =>
      apiCall('/api/protocols/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<ProtocolCategory> =>
      apiCall(`/api/protocols/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<unknown> =>
      apiCall(`/api/protocols/categories/${id}`, { method: 'DELETE' }),
  },
  items: {
    getByCategory: (categoryId: number): Promise<ProtocolItem[]> =>
      apiCall(`/api/protocols/categories/${categoryId}/items`),
    getOne: (id: number): Promise<ProtocolItem> => apiCall(`/api/protocols/items/${id}`),
    create: (data: Record<string, unknown>): Promise<ProtocolItem> =>
      apiCall('/api/protocols/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<ProtocolItem> =>
      apiCall(`/api/protocols/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<unknown> =>
      apiCall(`/api/protocols/items/${id}`, { method: 'DELETE' }),
  },
  blocks: {
    create: (data: Record<string, unknown>): Promise<ProtocolBlock> =>
      apiCall('/api/protocols/blocks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<ProtocolBlock> =>
      apiCall(`/api/protocols/blocks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<unknown> =>
      apiCall(`/api/protocols/blocks/${id}`, { method: 'DELETE' }),
  },
};
