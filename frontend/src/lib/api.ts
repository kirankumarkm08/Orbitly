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
    
    console.log('[ApiClient] Session:', session);
    if (session?.access_token) {
      console.log('[ApiClient] Token sent:', session.access_token);
      return { Authorization: `Bearer ${session.access_token}` };
    }
    console.log('[ApiClient] No session found');
    return {};
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    
    const authHeaders = await this.getAuthHeader();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
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
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: authHeaders,
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
  logout: async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '';

export const publicPagesApi = {
  getHomepage: async () => {
    const res = await fetch(`${API_URL}/public/pages/homepage?tenant_id=${TENANT_ID}`);
    if (!res.ok) return null;
    return res.json();
  },
  getBySlug: async (slug: string) => {
    const res = await fetch(`${API_URL}/public/pages/${slug}?tenant_id=${TENANT_ID}`);
    if (!res.ok) return null;
    return res.json();
  },
};
