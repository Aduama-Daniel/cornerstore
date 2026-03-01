const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: boolean;
}

const fetchWithAuth = async (
  endpoint: string,
  token: string | null = null,
  options: RequestInit = {}
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Support for Next.js caching options
  const fetchOptions = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

export const api = {
  // Products
  products: {
    getAll: (params?: Record<string, any>): Promise<ApiResponse> => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchWithAuth(`/api/products${query}`);
    },

    getBySlug: (slug: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/products/${slug}`),

    getByCategory: (slug: string, params?: Record<string, any>): Promise<ApiResponse> => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchWithAuth(`/api/products/category/${slug}${query}`);
    },

    getFeatured: (limit?: number): Promise<ApiResponse> => {
      const query = limit ? `?limit=${limit}` : '';
      return fetchWithAuth(`/api/products/featured${query}`);
    },

    getById: (id: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/products/${id}`),
  },

  // Categories
  categories: {
    getAll: (): Promise<ApiResponse> =>
      fetchWithAuth('/api/categories'),

    getBySlug: (slug: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/categories/${slug}`),
  },

  // User
  user: {
    updateProfile: (token: string | null, data: any): Promise<ApiResponse> =>
      fetchWithAuth('/api/user/profile', token, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Cart
  cart: {
    getCart: (token: string | null): Promise<ApiResponse> =>
      fetchWithAuth('/api/cart', token),

    addItem: (token: string | null, item: { productId: string; size: string; quantity: number }): Promise<ApiResponse> =>
      fetchWithAuth('/api/cart', token, {
        method: 'POST',
        body: JSON.stringify(item),
      }),

    updateItem: (token: string | null, itemId: string, quantity: number): Promise<ApiResponse> =>
      fetchWithAuth(`/api/cart/${itemId}`, token, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),

    removeItem: (token: string | null, itemId: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/cart/${itemId}`, token, {
        method: 'DELETE',
      }),

    clearCart: (token: string | null): Promise<ApiResponse> =>
      fetchWithAuth('/api/cart', token, {
        method: 'DELETE',
      }),

    syncCart: (token: string | null, items: any[]): Promise<ApiResponse> =>
      fetchWithAuth('/api/cart/sync', token, {
        method: 'POST',
        body: JSON.stringify({ items }),
      }),
  },

  // Orders
  orders: {
    create: (token: string | null, orderData: any): Promise<ApiResponse> =>
      fetchWithAuth('/api/orders', token, {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),

    update: (token: string | null, orderId: string, data: any): Promise<ApiResponse> =>
      fetchWithAuth(`/api/orders/${orderId}`, token, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getUserOrders: (token: string | null, params?: Record<string, any>): Promise<ApiResponse> => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchWithAuth(`/api/orders${query}`, token);
    },

    getById: (token: string | null, orderId: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/orders/${orderId}`, token),

    updateTracking: (token: string | null, orderId: string, trackingData: any): Promise<ApiResponse> =>
      fetchWithAuth(`/api/admin/orders/${orderId}/shipping`, token, {
        method: 'PUT',
        body: JSON.stringify(trackingData),
      }),
  },

  // Wishlist
  wishlist: {
    getAll: (token: string | null): Promise<ApiResponse> =>
      fetchWithAuth('/api/wishlist', token),

    add: (token: string | null, productId: string): Promise<ApiResponse> =>
      fetchWithAuth('/api/wishlist', token, {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }),

    remove: (token: string | null, productId: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/wishlist/${productId}`, token, {
        method: 'DELETE',
      }),
  },

  // Search
  search: (query: string, params?: Record<string, any>): Promise<ApiResponse> => {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return fetchWithAuth(`/api/search?${searchParams}`);
  },

  // Colors
  colors: {
    getAll: (): Promise<ApiResponse> =>
      fetchWithAuth('/api/colors'),

    getBySlug: (slug: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/colors/${slug}`),
  },

  // Inventory
  inventory: {
    getByProduct: (productId: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/inventory/${productId}`),

    checkAvailability: (productId: string, size: string, colorSlug: string, quantity?: number): Promise<ApiResponse> => {
      const params = new URLSearchParams({ size, colorSlug });
      if (quantity) params.append('quantity', quantity.toString());
      return fetchWithAuth(`/api/inventory/${productId}/check?${params}`);
    },
  },

  // Collections
  collections: {
    getAll: (): Promise<ApiResponse> => fetchWithAuth('/api/collections'),

    getFeatured: (): Promise<ApiResponse> => fetchWithAuth('/api/collections/featured'),

    getBySlug: (slug: string): Promise<ApiResponse> => fetchWithAuth(`/api/collections/${slug}`),

    getProducts: (collectionId: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/collections/${collectionId}/products`),
  },

  // Reviews
  reviews: {
    getAll: (): Promise<ApiResponse> =>
      fetchWithAuth('/api/reviews'),

    getByProduct: (productId: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/reviews/${productId}`),

    getRatingSummary: (productId: string): Promise<ApiResponse> =>
      fetchWithAuth(`/api/reviews/${productId}/summary`),

    create: (token: string | null, reviewData: any): Promise<ApiResponse> =>
      fetchWithAuth('/api/reviews', token, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
  },

  // Admin
  admin: {
    login: (username: string, password: string): Promise<ApiResponse> =>
      fetchWithAuth('/api/admin/login', null, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    getStats: (credentials: string): Promise<ApiResponse> =>
      fetchWithAuth('/api/admin/stats', null, {
        headers: { Authorization: `Basic ${credentials}` },
      }),

    // Categories
    categories: {
      getAll: (credentials: string): Promise<ApiResponse> =>
        fetchWithAuth('/api/admin/categories', null, {
          headers: { Authorization: `Basic ${credentials}` },
        }),

      create: (credentials: string, data: any): Promise<ApiResponse> =>
        fetchWithAuth('/api/admin/categories', null, {
          method: 'POST',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify(data),
        }),

      update: (credentials: string, id: string, data: any): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/categories/${id}`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify(data),
        }),

      delete: (credentials: string, id: string): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/categories/${id}`, null, {
          method: 'DELETE',
          headers: { Authorization: `Basic ${credentials}` },
        }),
    },

    // Products
    products: {
      getAll: (credentials: string, filters?: Record<string, any>): Promise<ApiResponse> => {
        const query = filters ? `?${new URLSearchParams(filters)}` : '';
        return fetchWithAuth(`/api/admin/products${query}`, null, {
          headers: { Authorization: `Basic ${credentials}` },
        });
      },

      getById: (credentials: string, id: string): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/products/${id}`, null, {
          headers: { Authorization: `Basic ${credentials}` },
        }),

      create: (credentials: string, data: any): Promise<ApiResponse> =>
        fetchWithAuth('/api/admin/products', null, {
          method: 'POST',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify(data),
        }),

      update: (credentials: string, id: string, data: any): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/products/${id}`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify(data),
        }),

      delete: (credentials: string, id: string): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/products/${id}`, null, {
          method: 'DELETE',
          headers: { Authorization: `Basic ${credentials}` },
        }),
    },

    // Colors
    colors: {
      getAll: (credentials: string): Promise<ApiResponse> =>
        fetchWithAuth('/api/admin/colors', null, {
          headers: { Authorization: `Basic ${credentials}` },
        }),

      create: (credentials: string, data: any): Promise<ApiResponse> =>
        fetchWithAuth('/api/admin/colors', null, {
          method: 'POST',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify(data),
        }),

      update: (credentials: string, id: string, data: any): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/colors/${id}`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify(data),
        }),

      delete: (credentials: string, id: string): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/colors/${id}`, null, {
          method: 'DELETE',
          headers: { Authorization: `Basic ${credentials}` },
        }),
    },

    // Inventory
    inventory: {
      update: (credentials: string, id: string, data: any): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/inventory/${id}`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify(data),
        }),

      getLowStock: (credentials: string, threshold?: number): Promise<ApiResponse> => {
        const query = threshold ? `?threshold=${threshold}` : '';
        return fetchWithAuth(`/api/admin/inventory/alerts/low-stock${query}`, null, {
          headers: { Authorization: `Basic ${credentials}` },
        });
      },

      bulkUpdate: (credentials: string, updates: any[]): Promise<ApiResponse> =>
        fetchWithAuth('/api/admin/inventory/bulk-update', null, {
          method: 'POST',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify({ updates }),
        }),
    },

    // Collections
    collections: {
      getAll: (credentials: string): Promise<ApiResponse> =>
        fetchWithAuth('/api/admin/collections', null, {
          headers: { Authorization: `Basic ${credentials}` },
        }),

      create: (credentials: string, data: any): Promise<ApiResponse> =>
        fetchWithAuth('/api/admin/collections', null, {
          method: 'POST',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify(data),
        }),

      update: (credentials: string, id: string, data: any): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/collections/${id}`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify(data),
        }),

      addProduct: (credentials: string, id: string, productId: string): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/collections/${id}/products`, null, {
          method: 'POST',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify({ productId }),
        }),

      reorder: (credentials: string, id: string, productIds: string[]): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/collections/${id}/reorder`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify({ productIds }),
        }),

      delete: (credentials: string, id: string): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/collections/${id}`, null, {
          method: 'DELETE',
          headers: { Authorization: `Basic ${credentials}` },
        }),
    },

    // Reviews
    reviews: {
      getAll: (credentials: string, filters?: Record<string, any>): Promise<ApiResponse> => {
        const query = filters ? `?${new URLSearchParams(filters)}` : '';
        return fetchWithAuth(`/api/admin/reviews${query}`, null, {
          headers: { Authorization: `Basic ${credentials}` },
        });
      },

      getPending: (credentials: string): Promise<ApiResponse> =>
        fetchWithAuth('/api/admin/reviews/pending', null, {
          headers: { Authorization: `Basic ${credentials}` },
        }),

      approve: (credentials: string, id: string): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/reviews/${id}/approve`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
        }),

      reject: (credentials: string, id: string): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/reviews/${id}/reject`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
        }),

      pin: (credentials: string, id: string, pinned: boolean): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/reviews/${id}/pin`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify({ pinned }),
        }),

      respond: (credentials: string, id: string, response: string): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/reviews/${id}/respond`, null, {
          method: 'POST',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify({ response }),
        }),

      moderate: (credentials: string, id: string, status: 'approved' | 'rejected'): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/reviews/${id}/moderate`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify({ status }),
        }),

      update: (credentials: string, id: string, data: any): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/reviews/${id}`, null, {
          method: 'PUT',
          headers: { Authorization: `Basic ${credentials}` },
          body: JSON.stringify(data),
        }),

      delete: (credentials: string, id: string): Promise<ApiResponse> =>
        fetchWithAuth(`/api/admin/reviews/${id}`, null, {
          method: 'DELETE',
          headers: { Authorization: `Basic ${credentials}` },
        }),
    },
  },

  // Chat
  chat: {
    sendMessage: (message: string, history: any[]): Promise<ApiResponse> =>
      fetchWithAuth('/api/chat', null, {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      }),
  },
};
