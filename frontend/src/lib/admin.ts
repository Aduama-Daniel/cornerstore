const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getAdminCredentials() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminCredentials') || '';
}

export async function adminRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const credentials = getAdminCredentials();
  if (!credentials) throw new Error('Admin session required');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Basic ${credentials}`,
    },
  });

  const data = await response.json().catch(() => ({ message: 'Request failed' }));
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('adminCredentials');
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const adminFetcher = <T = any>(endpoint: string) => adminRequest<T>(endpoint);
