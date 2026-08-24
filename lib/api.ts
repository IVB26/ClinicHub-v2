import type { AuthResponse, Policy, ProtocolCategory, ProtocolItem, ProtocolBlock, BoardingProcedure, Client, Appointment, CallLog, BankingTransaction, DailyReconciliation, DailySummary, OperationTask } from './types';

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
    apiCall<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: (): Promise<unknown> => apiCall<unknown>('/api/auth/logout', { method: 'POST' }),
};

// Policies endpoints
export const policiesAPI = {
  getAll: (): Promise<Policy[]> => apiCall<Policy[]>('/api/policies'),
  getOne: (id: string): Promise<Policy> => apiCall<Policy>(`/api/policies/${id}`),
  create: (data: Record<string, unknown>): Promise<Policy> =>
    apiCall<Policy>('/api/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>): Promise<Policy> =>
    apiCall<Policy>(`/api/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<unknown> =>
    apiCall<unknown>(`/api/policies/${id}`, { method: 'DELETE' }),
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
    getAll: (): Promise<ProtocolCategory[]> => apiCall<ProtocolCategory[]>('/api/protocols/categories'),
    create: (data: Record<string, unknown>): Promise<ProtocolCategory> =>
      apiCall<ProtocolCategory>('/api/protocols/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<ProtocolCategory> =>
      apiCall<ProtocolCategory>(`/api/protocols/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<unknown> =>
      apiCall<unknown>(`/api/protocols/categories/${id}`, { method: 'DELETE' }),
  },
  items: {
    getByCategory: (categoryId: number): Promise<ProtocolItem[]> =>
      apiCall<ProtocolItem[]>(`/api/protocols/categories/${categoryId}/items`),
    getOne: (id: number): Promise<ProtocolItem> => apiCall<ProtocolItem>(`/api/protocols/items/${id}`),
    create: (data: Record<string, unknown>): Promise<ProtocolItem> =>
      apiCall<ProtocolItem>('/api/protocols/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<ProtocolItem> =>
      apiCall<ProtocolItem>(`/api/protocols/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<unknown> =>
      apiCall<unknown>(`/api/protocols/items/${id}`, { method: 'DELETE' }),
  },
  blocks: {
    create: (data: Record<string, unknown>): Promise<ProtocolBlock> =>
      apiCall<ProtocolBlock>('/api/protocols/blocks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<ProtocolBlock> =>
      apiCall<ProtocolBlock>(`/api/protocols/blocks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<unknown> =>
      apiCall<unknown>(`/api/protocols/blocks/${id}`, { method: 'DELETE' }),
  },
};

// Boarding Procedures endpoints
export const boardingProceduresAPI = {
  getAll: (): Promise<BoardingProcedure[]> => apiCall<BoardingProcedure[]>('/api/boarding-procedures'),
  getOne: (id: number): Promise<BoardingProcedure> => apiCall<BoardingProcedure>(`/api/boarding-procedures/${id}`),
  create: (data: Record<string, unknown>): Promise<BoardingProcedure> =>
    apiCall<BoardingProcedure>('/api/boarding-procedures', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Record<string, unknown>): Promise<BoardingProcedure> =>
    apiCall<BoardingProcedure>(`/api/boarding-procedures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number): Promise<unknown> =>
    apiCall<unknown>(`/api/boarding-procedures/${id}`, { method: 'DELETE' }),
  uploadPdf: async (id: number, file: File): Promise<{ success: boolean; pdfUrl: string }> => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${API_BASE}/api/boarding-procedures/${id}/pdf`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    return response.json();
  },
};

// Reception endpoints
export const receptionAPI = {
  clients: {
    getAll: (): Promise<Client[]> => apiCall<Client[]>('/api/reception/clients'),
    getOne: (id: number): Promise<Client> => apiCall<Client>(`/api/reception/clients/${id}`),
    create: (data: Record<string, unknown>): Promise<Client> =>
      apiCall<Client>('/api/reception/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<Client> =>
      apiCall<Client>(`/api/reception/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<unknown> =>
      apiCall<unknown>(`/api/reception/clients/${id}`, { method: 'DELETE' }),
  },
  appointments: {
    getAll: (): Promise<Appointment[]> => apiCall<Appointment[]>('/api/reception/appointments'),
    getByDate: (date: string): Promise<Appointment[]> =>
      apiCall<Appointment[]>(`/api/reception/appointments?date=${date}`),
    getOne: (id: number): Promise<Appointment> => apiCall<Appointment>(`/api/reception/appointments/${id}`),
    create: (data: Record<string, unknown>): Promise<Appointment> =>
      apiCall<Appointment>('/api/reception/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<Appointment> =>
      apiCall<Appointment>(`/api/reception/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<unknown> =>
      apiCall<unknown>(`/api/reception/appointments/${id}`, { method: 'DELETE' }),
  },
  callLog: {
    getAll: (): Promise<CallLog[]> => apiCall<CallLog[]>('/api/reception/call-log'),
    getByClient: (clientId: number): Promise<CallLog[]> =>
      apiCall<CallLog[]>(`/api/reception/call-log?clientId=${clientId}`),
    create: (data: Record<string, unknown>): Promise<CallLog> =>
      apiCall<CallLog>('/api/reception/call-log', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

// Banking endpoints
export const bankingAPI = {
  transactions: {
    getAll: (): Promise<BankingTransaction[]> => apiCall<BankingTransaction[]>('/api/banking/transactions'),
    getByDate: (date: string): Promise<BankingTransaction[]> =>
      apiCall<BankingTransaction[]>(`/api/banking/transactions?date=${date}`),
    getByDateRange: (startDate: string, endDate: string): Promise<BankingTransaction[]> =>
      apiCall<BankingTransaction[]>(
        `/api/banking/transactions?startDate=${startDate}&endDate=${endDate}`
      ),
    getOne: (id: number): Promise<BankingTransaction> =>
      apiCall<BankingTransaction>(`/api/banking/transactions/${id}`),
    create: (data: Record<string, unknown>): Promise<BankingTransaction> =>
      apiCall<BankingTransaction>('/api/banking/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<BankingTransaction> =>
      apiCall<BankingTransaction>(`/api/banking/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<unknown> =>
      apiCall<unknown>(`/api/banking/transactions/${id}`, { method: 'DELETE' }),
  },
  reconciliation: {
    getByDate: (date: string): Promise<DailyReconciliation> =>
      apiCall<DailyReconciliation>(`/api/banking/reconciliation?date=${date}`),
    create: (data: Record<string, unknown>): Promise<DailyReconciliation> =>
      apiCall<DailyReconciliation>('/api/banking/reconciliation', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<DailyReconciliation> =>
      apiCall<DailyReconciliation>(`/api/banking/reconciliation/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  reports: {
    dailySummary: (date: string): Promise<DailySummary> =>
      apiCall<DailySummary>(`/api/banking/reports/daily?date=${date}`),
    weeklySummary: (startDate: string, endDate: string): Promise<DailySummary[]> =>
      apiCall<DailySummary[]>(`/api/banking/reports/weekly?startDate=${startDate}&endDate=${endDate}`),
    monthlySummary: (month: string): Promise<DailySummary[]> =>
      apiCall<DailySummary[]>(`/api/banking/reports/monthly?month=${month}`),
  },
};

// Operations / Daily Tasks endpoints
export const operationsAPI = {
  tasks: {
    getAll: (): Promise<OperationTask[]> => apiCall<OperationTask[]>('/api/operations/tasks'),
    getByStatus: (status: string): Promise<OperationTask[]> =>
      apiCall<OperationTask[]>(`/api/operations/tasks?status=${status}`),
    getToday: (): Promise<OperationTask[]> =>
      apiCall<OperationTask[]>('/api/operations/tasks?date=today'),
    getOne: (id: number): Promise<OperationTask> =>
      apiCall<OperationTask>(`/api/operations/tasks/${id}`),
    create: (data: Record<string, unknown>): Promise<OperationTask> =>
      apiCall<OperationTask>('/api/operations/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<OperationTask> =>
      apiCall<OperationTask>(`/api/operations/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number): Promise<unknown> =>
      apiCall<unknown>(`/api/operations/tasks/${id}`, { method: 'DELETE' }),
  },
};
