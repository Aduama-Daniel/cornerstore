'use client';

import { useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';

interface WishlistButtonProps {
    productId: string;
    productName?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function WishlistButton({
    productId,
    productName,
    size = 'md',
    showLabel = false
}: WishlistButtonProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [isAnimating, setIsAnimating] = useState(false);

    const inWishlist = isInWishlist(productId);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);

        if (inWishlist) {
            await removeFromWishlist(productId, productName);
        } else {
            await addToWishlist(productId, productName);
        }
    };

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <button
            onClick={handleClick}
            className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        bg-white hover:bg-gray-50
        border border-gray-200
        transition-all duration-200
        group
        ${isAnimating ? 'scale-125' : 'scale-100'}
      `}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {showLabel ? (
                <div className="flex items-center gap-2 px-4">
                    <svg
                        className={`${iconSizes[size]} transition-all duration-200 ${inWishlist
                                ? 'fill-red-500 stroke-red-500'
                                : 'fill-none stroke-gray-600 group-hover:stroke-red-500'
                            }`}
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    <span className="text-sm font-medium">
                        {inWishlist ? 'Saved' : 'Save'}
                    </span>
                </div>
            ) : (
                <svg
                    className={`${iconSizes[size]} transition-all duration-200 ${inWishlist
                            ? 'fill-red-500 stroke-red-500 animate-heart-beat'
                            : 'fill-none stroke-gray-600 group-hover:stroke-red-500 group-hover:scale-110'
                        }`}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            )}
        </button>
    );
}
