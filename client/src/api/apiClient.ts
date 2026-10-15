import { auth, isFirebaseConfigured } from '../services/firebase';

export const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    // In local development (Vite dev server on port 5173 / 3000), target backend on port 8080
    if (window.location.port === '5173' || window.location.port === '3000') {
      const devHost = window.location.hostname || 'localhost';
      return `${window.location.protocol}//${devHost}:8080/api`;
    }
    // In production (served from same origin or reverse proxy)
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:8080/api';
};

export async function getAuthToken(): Promise<string> {
  if (isFirebaseConfigured && auth?.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch {}
  }

  // Fallback to stored local user session
  try {
    const local = localStorage.getItem('chat_app_user') || localStorage.getItem('hivetalk_user') || localStorage.getItem('gather_user');
    if (local) {
      const parsed = JSON.parse(local);
      const str = unescape(encodeURIComponent(JSON.stringify(parsed)));
      const encoded = btoa(str);
      return `mock_${encoded}`;
    }
  } catch {}

  return 'mock_anonymous';
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const url = getApiBase() + path;
  const method = init.method || 'GET';

  const isFormData = init.body instanceof FormData;
  const headers: Record<string, string> = {
    authorization: `Bearer ${token}`,
    ...(init.headers as Record<string, string>),
  };

  if (!isFormData) {
    headers['content-type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers,
    });
  } catch (networkErr: any) {
    // If direct local dev URL failed, try Vite's proxy `/api${path}` as automatic fallback
    if (typeof window !== 'undefined' && url.includes(':8080/api')) {
      try {
        response = await fetch(`/api${path}`, {
          ...init,
          headers,
        });
      } catch {
        console.error('[API Fetch Error]:', {
          url,
          method,
          error: networkErr?.message || networkErr,
        });
        throw new Error('Unable to connect to chat server. Please make sure the backend server is running.');
      }
    } else {
      console.error('[API Fetch Error]:', {
        url,
        method,
        error: networkErr?.message || networkErr,
      });
      throw new Error('Unable to connect to chat server. Please make sure the backend server is running.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error('[API Request Failed]:', {
      url,
      method,
      status: response.status,
      statusText: response.statusText,
      body: errorData,
    });
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
}

export const apiClient = {
  get: async <T = any>(path: string): Promise<{ data: T }> => {
    const data = await api<T>(path.replace(/^\/api/, ''), { method: 'GET' });
    return { data };
  },
  post: async <T = any>(path: string, body?: any): Promise<{ data: T }> => {
    const data = await api<T>(path.replace(/^\/api/, ''), {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
  patch: async <T = any>(path: string, body?: any): Promise<{ data: T }> => {
    const data = await api<T>(path.replace(/^\/api/, ''), {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
  delete: async <T = any>(path: string): Promise<{ data: T }> => {
    const data = await api<T>(path.replace(/^\/api/, ''), { method: 'DELETE' });
    return { data };
  },
};

