'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface RecentlyViewedItem {
    productId: string;
    viewedAt: number;
}

interface RecentlyViewedContextType {
    addProduct: (productId: string) => void;
    getRecentProducts: () => string[];
    clearHistory: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType>({
    addProduct: () => { },
    getRecentProducts: () => [],
    clearHistory: () => { },
});

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);

const STORAGE_KEY = 'cornerstore_recently_viewed';
const MAX_ITEMS = 10;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<RecentlyViewedItem[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        loadFromStorage();
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        saveToStorage(items);
    }, [items]);

    const loadFromStorage = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Filter out items older than 30 days
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const filtered = parsed.filter((item: RecentlyViewedItem) =>
                    item.viewedAt > thirtyDaysAgo
                );
                setItems(filtered);
            }
        } catch (error) {
            console.error('Failed to load recently viewed:', error);
        }
    };

    const saveToStorage = (items: RecentlyViewedItem[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save recently viewed:', error);
        }
    };

    const addProduct = useCallback((productId: string) => {
        setItems(prev => {
            // Remove if already exists
            const filtered = prev.filter(item => item.productId !== productId);

            // Add to beginning
            const newItems = [
                { productId, viewedAt: Date.now() },
                ...filtered
            ];

            // Keep only MAX_ITEMS
            return newItems.slice(0, MAX_ITEMS);
        });
    }, []);

    const getRecentProducts = useCallback((): string[] => {
        return items.map(item => item.productId);
    }, [items]);

    const clearHistory = useCallback(() => {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return (
        <RecentlyViewedContext.Provider
            value={{
                addProduct,
                getRecentProducts,
                clearHistory,
            }}
        >
            {children}
        </RecentlyViewedContext.Provider>
    );
}
