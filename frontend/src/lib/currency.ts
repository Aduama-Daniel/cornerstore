/**
 * Currency utility for Ghana Cedis (GH₵)
 */

export const CURRENCY_SYMBOL = 'GH₵';
export const CURRENCY_CODE = 'GHS';

/**
 * Format price in Ghana Cedis
 * @param price - Price in GHS (already in cedis)
 * @returns Formatted price string in GHS
 */
export function formatPrice(price: number): string {
    return `${CURRENCY_SYMBOL}${price.toFixed(2)}`;
}

/**
 * Convert price to GHS (no conversion needed - prices are already in cedis)
 * @param price - Price in GHS
 * @returns Price in GHS
 */
export function convertToGHS(price: number): number {
    return price;
}

/**
 * Format shipping threshold message
 */
export const FREE_SHIPPING_THRESHOLD_GHS = 500; // 500 GHS minimum for free shipping

export function getFreeShippingMessage(): string {
    return `Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD_GHS)}`;
}
