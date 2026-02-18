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
  private async getTenantHeader(): Promise<Record<string, string>> {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Tenant ID is stored in user metadata after login
    const tenantId = user?.user_metadata?.tenant_id;
    
    if (tenantId) {
      return { 'X-Tenant-Id': tenantId };
    }
    
    // Fallback to env variable for public routes
    const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    if (envTenantId) {
      return { 'X-Tenant-Id': envTenantId };
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
};
