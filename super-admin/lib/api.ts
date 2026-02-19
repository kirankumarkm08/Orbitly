const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiRequest<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: any) => apiRequest<{ token: string; session: any; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  // Dashboard
  getStats: () => apiRequest<any>('/admin/stats'),
  
  // Tenants
  getTenants: () => apiRequest<any[]>('/admin/tenants'),
  createTenant: (data: any) => apiRequest<any>('/admin/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteTenant: (id: string) => apiRequest<void>(`/admin/tenants/${id}`, {
    method: 'DELETE',
  }),
  getTenantModules: (tenantId: string) => apiRequest<any[]>(`/admin/tenants/${tenantId}/modules`),
  toggleModule: (tenantId: string, moduleName: string, isEnabled: boolean) => 
    apiRequest<any>(`/admin/tenants/${tenantId}/modules/${moduleName}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_enabled: isEnabled }),
    }),
  
  // Users
  getUsers: () => apiRequest<any[]>('/admin/users'),
  assignTenant: (userId: string, tenantId: string) => apiRequest<void>('/admin/users/assign-tenant', {
    method: 'POST',
    body: JSON.stringify({ userId, tenantId }),
  }),
  updateRole: (userId: string, role: string) => apiRequest<void>('/admin/users/role', {
    method: 'PUT',
    body: JSON.stringify({ userId, role }),
  }),
};
