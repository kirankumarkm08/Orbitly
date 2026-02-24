import { getSupabaseClient } from './supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private async getAuthHeader(): Promise<Record<string, string>> {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
    return {};
  }

  // Get tenant ID from logged-in user's metadata
  // For authenticated routes, the tenant always comes from the user profile.
  // Public routes use dynamic domain-based resolution (see resolve-tenant.ts).
  private async getTenantHeader(): Promise<Record<string, string>> {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Tenant ID is stored in user metadata after login
    const tenantId = user?.user_metadata?.tenant_id;
    
    if (tenantId) {
      return { 'X-Tenant-Id': tenantId };
    }
    
    return {};
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    
    const authHeaders = await this.getAuthHeader();
    const tenantHeaders = await this.getTenantHeader();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...tenantHeaders,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      console.error('API Error:', errorMessage, 'Status:', response.status);
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Convenience methods
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload
  async upload(endpoint: string, file: File, additionalData?: Record<string, string>) {
    const authHeaders = await this.getAuthHeader();
    const tenantHeaders = await this.getTenantHeader();
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        ...tenantHeaders,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
}

export const api = new ApiClient();

// ============ API Functions ============

// Auth
export const authApi = {
  login: async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  register: async (email: string, password: string, full_name?: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    });
    if (error) throw error;
    return data;
  },
  signInWithGoogle: async (redirectTo = '/admin/studio') => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` : undefined,
      },
    });
    if (error) throw error;
    return data;
  },
  logout: async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  // Get current user with tenant info
  getCurrentUser: async () => {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};

// Pages
export const pagesApi = {
  list: () => api.get<any[]>('/pages'),
  get: (id: string) => api.get<any>(`/pages/${id}`),
  create: (data: any) => api.post<any>('/pages', data),
  update: (id: string, data: any) => api.put<any>(`/pages/${id}`, data),
  delete: (id: string) => api.delete(`/pages/${id}`),
  publish: (id: string) => api.post<any>(`/pages/${id}/publish`, {}),
};

// E-commerce
export const productsApi = {
  list: (params: { status?: string; category_id?: string; limit?: number; offset?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.category_id) query.append('category_id', params.category_id);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());
    return api.get<{ data: any[]; count: number }>(`/products${query.toString() ? `?${query.toString()}` : ''}`);
  },
  get: (id: string) => api.get<any>(`/products/${id}`),
  create: (data: any) => api.post<any>('/products', data),
  update: (id: string, data: any) => api.put<any>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  
  // Variants
  listVariants: (productId: string) => api.get<any[]>(`/products/${productId}/variants`),
  createVariant: (productId: string, data: any) => api.post<any>(`/products/${productId}/variants`, data),
  updateVariant: (productId: string, variantId: string, data: any) => api.put<any>(`/products/${productId}/variants/${variantId}`, data),
  deleteVariant: (productId: string, variantId: string) => api.delete(`/products/${productId}/variants/${variantId}`),
};

export const categoriesApi = {
  list: () => api.get<any[]>('/categories'),
  get: (id: string) => api.get<any>(`/categories/${id}`),
  create: (data: any) => api.post<any>('/categories', data),
  update: (id: string, data: any) => api.put<any>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Assets
export const assetsApi = {
  list: () => api.get<any[]>('/assets'),
  upload: (file: File, name?: string) => api.upload('/assets/upload', file, name ? { name } : undefined),
  delete: (id: string) => api.delete(`/assets/${id}`),
};

// Events
export const eventsApi = {
  list: (status?: string) => api.get<any[]>(`/events${status ? `?status=${status}` : ''}`),
  get: (id: string) => api.get<any>(`/events/${id}`),
  getPublic: (slug: string) => api.get<any>(`/events/public/${slug}`),
  create: (data: any) => api.post<any>('/events', data),
  update: (id: string, data: any) => api.put<any>(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  publish: (id: string) => api.post<any>(`/events/${id}/publish`, {}),
  addSpeaker: (eventId: string, data: any) => api.post<any>(`/events/${eventId}/speakers`, data),
  removeSpeaker: (eventId: string, speakerId: string) => api.delete(`/events/${eventId}/speakers/${speakerId}`),
};

// Speakers
export const speakersApi = {
  list: (featured?: boolean) => api.get<any[]>(`/speakers${featured ? '?featured=true' : ''}`),
  get: (id: string) => api.get<any>(`/speakers/${id}`),
  create: (data: any) => api.post<any>('/speakers', data),
  update: (id: string, data: any) => api.put<any>(`/speakers/${id}`, data),
  delete: (id: string) => api.delete(`/speakers/${id}`),
};

// Registrations
export const registrationsApi = {
  register: (data: any) => api.post<any>('/registrations', data),
  listForEvent: (eventId: string, status?: string) => 
    api.get<any[]>(`/registrations/event/${eventId}${status ? `?status=${status}` : ''}`),
  updateStatus: (id: string, status: string) => 
    api.put<any>(`/registrations/${id}/status`, { status }),
  cancel: (id: string) => api.delete(`/registrations/${id}`),
};

// Templates
export const templatesApi = {
  list: (category?: string) => api.get<any[]>(`/templates${category ? `?category=${category}` : ''}`),
  get: (id: string) => api.get<any>(`/templates/${id}`),
  create: (data: any) => api.post<any>('/templates', data),
  duplicate: (id: string, name?: string) => api.post<any>(`/templates/${id}/duplicate`, { name }),
  delete: (id: string) => api.delete(`/templates/${id}`),
};

// Public Pages (no auth required - for end-user rendering)
// These use query params since they're accessed by visitors
export const publicPagesApi = {
  getHomepage: async (tenantId: string) => {
    const res = await fetch(`${API_URL}/public/pages/homepage?tenant_id=${tenantId}`);
    if (!res.ok) return null;
    return res.json();
  },
  getBySlug: async (slug: string, tenantId: string) => {
    const res = await fetch(`${API_URL}/public/pages/${slug}?tenant_id=${tenantId}`);
    if (!res.ok) return null;
    return res.json();
  },
  listPublicProducts: async (tenantId: string, categoryId?: string) => {
    const query = new URLSearchParams({ tenant_id: tenantId });
    if (categoryId) query.append('category_id', categoryId);
    const res = await fetch(`${API_URL}/public/products?${query.toString()}`);
    if (!res.ok) return [];
    return res.json();
  },
  getPublicProduct: async (slug: string, tenantId: string) => {
    const res = await fetch(`${API_URL}/public/products/${slug}?tenant_id=${tenantId}`);
    if (!res.ok) return null;
    return res.json();
  },
};

// Stripe Payments
export const stripeApi = {
  createCheckoutSession: async (data: { 
    line_items: any[]; 
    success_url?: string; 
    cancel_url?: string; 
    metadata?: any 
  }) => {
    return api.post<{ url: string; id: string }>('/stripe/checkout', data);
  },
  getConnectOnboardingUrl: async () => {
    return api.post<{ url: string }>('/stripe/connect/onboarding', {});
  },
  getConnectStatus: async () => {
    return api.get<{ connected: boolean; id?: string; charges_enabled?: boolean; payouts_enabled?: boolean }>('/stripe/connect/status');
  },
  getSummary: async () => {
    return api.get<any>('/stripe/summary');
  },
};

// Orders
export const ordersApi = {
  list: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return api.get<{ data: any[]; count: number }>(`/orders?${query}`);
  },
  get: async (id: string) => {
    return api.get<any>(`/orders/${id}`);
  },
  updateStatus: async (id: string, status: string) => {
    return api.put<any>(`/orders/${id}/status`, { status });
  },
};

// Customers
export const customersApi = {
  list: (params: { status?: string; search?: string; limit?: number; offset?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());
    return api.get<{ data: any[]; count: number }>(`/customers${query.toString() ? `?${query.toString()}` : ''}`);
  },
  get: (id: string) => api.get<any>(`/customers/${id}`),
  create: (data: any) => api.post<any>('/customers', data),
  update: (id: string, data: any) => api.put<any>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  sync: () => api.post<any>('/customers/sync', {}),
};

// Team Users
export const usersApi = {
  list: (params: { role?: string; search?: string; limit?: number; offset?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());
    return api.get<{ data: any[]; count: number }>(`/users${query.toString() ? `?${query.toString()}` : ''}`);
  },
  get: (id: string) => api.get<any>(`/users/${id}`),
  invite: (data: { email: string; full_name?: string; role?: string }) => 
    api.post<any>('/users/invite', data),
  update: (id: string, data: any) => api.put<any>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Forms
export const formsApi = {
  list: (params: { status?: string; search?: string; limit?: number; offset?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());
    return api.get<{ data: any[]; count: number }>(`/forms${query.toString() ? `?${query.toString()}` : ''}`);
  },
  get: (id: string) => api.get<any>(`/forms/${id}`),
  create: (data: any) => api.post<any>('/forms', data),
  update: (id: string, data: any) => api.put<any>(`/forms/${id}`, data),
  delete: (id: string) => api.delete(`/forms/${id}`),
  getSubmissions: (id: string) => api.get<any[]>(`/forms/${id}/submissions`),
  submit: (id: string, data: any) => api.post<any>(`/forms/${id}/submit`, data),
};

// AI Block Generator
export const aiApi = {
  generateBlock: (data: { prompt: string; category?: string; style_preferences?: { theme?: string; accent_color?: string } }) =>
    api.post<{ html: string; css: string; name: string; description: string; category: string; ai_generated: boolean }>('/ai/generate-block', data),
  refineBlock: (data: { prompt: string; current_html: string; current_css: string }) =>
    api.post<{ html: string; css: string }>('/ai/refine-block', data),
};

// Tenant / Onboarding
export const tenantApi = {
  onboarding: (data: { email: string; password: string; full_name: string; niche: string; domain: string }) =>
    api.post<{ message: string; tenant: any; user: any }>('/public/onboarding', data),
};
