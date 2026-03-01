'use client';

// ... imports
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { api } from '@/lib/api';

interface Product {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    category: any; // Using any to avoid type issues, or string if known
    // add other fields as needed
}

interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (productId: string, productName?: string) => Promise<void>;
    removeFromWishlist: (productId: string, productName?: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    count: number;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
    wishlist: [],
    addToWishlist: async () => { },
    removeFromWishlist: async () => { },
    isInWishlist: () => false,
    count: 0,
    loading: false,
});

export const useWishlist = () => useContext(WishlistContext);

const WISHLIST_STORAGE_KEY = 'cornerstore_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, getIdToken } = useAuth();
    const { addToast } = useToast();

    // Memoized list of IDs for fast lookup
    const wishlistIds = useMemo(() => {
        return new Set(wishlist.map(p => p._id));
    }, [wishlist]);

    // Load wishlist on mount
    useEffect(() => {
        loadWishlist();
    }, [user]);

    const loadWishlist = async () => {
        try {
            setLoading(true);

            if (user) {
                // Fetch from backend for authenticated users
                const token = await getIdToken();

                if (!token) {
                    console.warn('User present but no token available for wishlist');
                    setLoading(false);
                    return;
                }

                const response = await api.wishlist.getAll(token);

                if (response.success && response.data) {
                    // Backend now returns { ..., product: Product }
                    const products = response.data.map((item: any) => item.product);
                    setWishlist(products);

                    // Sync any guest wishlist items
                    const guestWishlistIds = getGuestWishlistIds();
                    if (guestWishlistIds.length > 0) {
                        await syncGuestWishlist(guestWishlistIds, token);
                    }
                }
            } else {
                // Load from localStorage for guests
                const guestIds = getGuestWishlistIds();
                if (guestIds.length > 0) {
                    // Fetch product details for these IDs
                    // Assuming api.products.getAll supports ?ids=id1,id2
                    const response = await api.products.getAll({ ids: guestIds.join(',') });
                    if (response.success && response.data) {
                        setWishlist(response.data);
                    }
                } else {
                    setWishlist([]);
                }
            }
        } catch (error) {
            console.error('Failed to load wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGuestWishlistIds = (): string[] => {
        try {
            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    const saveGuestWishlistIds = (productIds: string[]) => {
        try {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(productIds));
        } catch (error) {
            console.error('Failed to save guest wishlist:', error);
        }
    };

    const syncGuestWishlist = async (guestItems: string[], token: string | null) => {
        try {
            // Add all guest items to user's wishlist
            for (const productId of guestItems) {
                await api.wishlist.add(token, productId);
            }

            // Clear guest wishlist
            localStorage.removeItem(WISHLIST_STORAGE_KEY);

            // Reload wishlist to get updated list
            await loadWishlist();
        } catch (error) {
            console.error('Failed to sync guest wishlist:', error);
        }
    };

    const addToWishlist = async (productId: string, productName?: string) => {
        try {
            if (user) {
                // Add to backend
                const token = await getIdToken();

                if (!token) {
                    addToast('Authentication error. Please log in again.', 'error');
                    return;
                }

                const response = await api.wishlist.add(token, productId);

                if (response.success) {
                    // For now, reload to get the full product details
                    // Optimization: Could fetch single product, but reload is safer
                    await loadWishlist();

                    addToast(
                        productName ? `${productName} added to wishlist` : 'Added to wishlist',
                        'success'
                    );
                }
            } else {
                // Add to localStorage
                const currentIds = getGuestWishlistIds();
                if (!currentIds.includes(productId)) {
                    const newIds = [...currentIds, productId];
                    saveGuestWishlistIds(newIds);

                    // Fetch full product to update state immediately
                    const response = await api.products.getById(productId); // Assuming getById works
                    if (response.success && response.data) {
                        setWishlist(prev => [...prev, response.data]);
                    }

                    addToast(
                        productName ? `${productName} added to wishlist` : 'Added to wishlist',
                        'success'
                    );
                }
            }
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            addToast('Failed to add to wishlist', 'error');
        }
    };

    const removeFromWishlist = async (productId: string, productName?: string) => {
        try {
            if (user) {
                // Remove from backend
                const token = await getIdToken();

                if (!token) {
                    addToast('Authentication error. Please log in again.', 'error');
                    return;
                }

                const response = await api.wishlist.remove(token, productId);

                if (response.success) {
                    setWishlist(prev => prev.filter(p => p._id !== productId));
                    addToast(
                        productName ? `${productName} removed from wishlist` : 'Removed from wishlist',
                        'info'
                    );
                }
            } else {
                // Remove from localStorage
                const currentIds = getGuestWishlistIds();
                const newIds = currentIds.filter(id => id !== productId);
                saveGuestWishlistIds(newIds);

                setWishlist(prev => prev.filter(p => p._id !== productId));

                addToast(
                    productName ? `${productName} removed from wishlist` : 'Removed from wishlist',
                    'info'
                );
            }
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            addToast('Failed to remove from wishlist', 'error');
        }
    };

    const isInWishlist = (productId: string): boolean => {
        return wishlistIds.has(productId);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                count: wishlist.length,
                loading,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}
