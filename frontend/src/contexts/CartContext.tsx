'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';

export interface CartItem {
  id: string;
  productId: string;
  size: string;
  colorSlug?: string; // Added for variation support
  quantity: number;
  price: number;
  product?: {
    name: string;
    slug: string;
    price: number;
    images: string[];
    status: string;
    origin?: string;
    originType?: 'local' | 'international';
    paymentMode?: 'pay_on_delivery' | 'upfront' | 'both';
    estimatedDeliveryLabel?: string;
    returnEligible?: boolean;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  /** True once the cart has been loaded from storage — avoid empty-cart redirects before this. */
  initialized: boolean;
  addItem: (productId: string, size: string, quantity?: number, colorSlug?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  total: 0,
  loading: false,
  initialized: false,
  addItem: async () => { },
  updateQuantity: async () => { },
  removeItem: async () => { },
  clearCart: async () => { },
  syncCart: async () => { },
});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'cornerstore_cart';

// Fetch specific products by id (server supports ?ids=a,b,c) instead of paging
// through the whole catalog.
async function fetchProductsByIds(ids: string[]): Promise<any[]> {
  if (ids.length === 0) return [];
  const response = await api.products.getAll({ ids: ids.join(',') });
  return response.success && Array.isArray(response.data) ? response.data : [];
}

// The price a customer actually pays right now.
function effectivePrice(product: any): number {
  return product.discountPrice != null && product.discountPrice > 0 && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;
}

function toCartProduct(product: any): NonNullable<CartItem['product']> {
  return {
    name: product.name,
    slug: product.slug,
    price: product.price,
    images: product.images || product.mainMedia?.map((m: any) => m.url) || [],
    status: product.status,
    origin: product.origin,
    originType: product.originType,
    paymentMode: product.paymentMode,
    estimatedDeliveryLabel: product.estimatedDeliveryLabel,
    returnEligible: product.returnEligible,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, getIdToken } = useAuth();

  // Load cart from localStorage on mount and hydrate product data
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
        // Hydrate cart items with product data if missing
        hydrateCartItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // Sync with server when user logs in
  useEffect(() => {
    if (user && items.length > 0) {
      syncCart();
    } else if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getIdToken();
      const response = await api.cart.getCart(token);

      if (response.success && response.data) {
        setItems(response.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncCart = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      const response = await api.cart.syncCart(token, items);

      if (response.success && response.data) {
        setItems(response.data.items || []);
      }
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  };

  // Hydrate cart items with product data (fixes items saved before the
  // product loaded, and refreshes stale prices)
  const hydrateCartItems = async (cartItems: CartItem[]) => {
    const itemsNeedingHydration = cartItems.filter(item => !item.product || !item.price);

    if (itemsNeedingHydration.length === 0) return;

    try {
      const products = await fetchProductsByIds(itemsNeedingHydration.map((item) => item.productId));
      const byId = new Map(products.map((p: any) => [p._id, p]));

      const hydratedItems = cartItems.map((item) => {
        if (item.product && item.price) return item;
        const product = byId.get(item.productId);
        if (!product) return item;
        return {
          ...item,
          price: effectivePrice(product),
          product: toCartProduct(product),
        };
      });

      setItems(hydratedItems);
    } catch (error) {
      console.error('Failed to hydrate cart items:', error);
    }
  };

  const addItem = async (productId: string, size: string, quantity: number = 1, colorSlug?: string) => {
    if (user) {
      try {
        setLoading(true);
        const token = await getIdToken();
        const response = await api.cart.addItem(token, { productId, size, quantity });

        if (response.success && response.data) {
          setItems(response.data.items || []);
        }
      } catch (error) {
        console.error('Failed to add item:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      // Local cart for non-authenticated users
      const existingItemIndex = items.findIndex(
        (item) => item.productId === productId && item.size === size && item.colorSlug === colorSlug
      );

      if (existingItemIndex > -1) {
        const newItems = [...items];
        newItems[existingItemIndex].quantity += quantity;
        setItems(newItems);
      } else {
        // Fetch product details to populate the cart item. If this fails we
        // surface the error rather than adding an unpriced item.
        const [product] = await fetchProductsByIds([productId]);

        if (!product) {
          throw new Error('This product is no longer available.');
        }

        const newItem: CartItem = {
          id: `local_${Date.now()}`,
          productId,
          size,
          colorSlug,
          quantity,
          price: effectivePrice(product),
          product: toCartProduct(product),
        };
        setItems([...items, newItem]);
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (user) {
      try {
        setLoading(true);
        const token = await getIdToken();
        const response = await api.cart.updateItem(token, itemId, quantity);

        if (response.success && response.data) {
          setItems(response.data.items || []);
        }
      } catch (error) {
        console.error('Failed to update item:', error);
      } finally {
        setLoading(false);
      }
    } else {
      const newItems = items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      setItems(newItems);
    }
  };

  const removeItem = async (itemId: string) => {
    if (user) {
      try {
        setLoading(true);
        const token = await getIdToken();
        const response = await api.cart.removeItem(token, itemId);

        if (response.success && response.data) {
          setItems(response.data.items || []);
        }
      } catch (error) {
        console.error('Failed to remove item:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setItems(items.filter((item) => item.id !== itemId));
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        const token = await getIdToken();
        await api.cart.clearCart(token);
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    items,
    itemCount,
    total,
    loading,
    initialized: isInitialized,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    syncCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
