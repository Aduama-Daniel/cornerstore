# Cornerstore - Complete Implementation Guide

## 📋 Status: Core Backend & Frontend Foundation Complete

### ✅ Completed Components

#### Backend (Fastify + MongoDB)
- ✅ Server setup with Fastify
- ✅ MongoDB database configuration with indexes
- ✅ Firebase Admin SDK integration
- ✅ Authentication middleware
- ✅ Complete API routes:
  - Products (GET all, by slug, by category, featured)
  - Categories (GET all, by slug)
  - Cart (full CRUD + sync)
  - Orders (create, get history, get by ID)
  - Search (text search with fallback)
- ✅ Service layer for business logic
- ✅ Database seed script with sample products

#### Frontend (Next.js 14)
- ✅ Next.js App Router configuration
- ✅ Tailwind CSS with custom design system
- ✅ TypeScript configuration
- ✅ Firebase client setup
- ✅ Authentication context (email/password + Google)
- ✅ Cart context with local storage
- ✅ API client library
- ✅ Global styles with premium aesthetic
- ✅ Root layout with providers

---

## 🚧 Remaining Components to Implement

### 1. Frontend Components

#### A. Header Component (`/src/components/Header.tsx`)
```typescript
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-neutral/20">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-serif font-semibold tracking-tight">
            CORNERSTORE
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="link-underline">Shop</Link>
            <Link href="/collections" className="link-underline">Collections</Link>
            <Link href="/about" className="link-underline">About</Link>
            <Link href="/lookbook" className="link-underline">Lookbook</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <Link href="/search" className="hover:text-neutral transition-colors">
              <SearchIcon />
            </Link>
            
            {user ? (
              <Link href="/account" className="hover:text-neutral transition-colors">
                <UserIcon />
              </Link>
            ) : (
              <Link href="/login" className="text-sm uppercase tracking-wide">
                Sign In
              </Link>
            )}
            
            <Link href="/cart" className="relative hover:text-neutral transition-colors">
              <BagIcon />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-contrast text-cream text-xs flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

// Icon components (implement with SVG)
const SearchIcon = () => (/* SVG */);
const UserIcon = () => (/* SVG */);
const BagIcon = () => (/* SVG */);
```

#### B. Footer Component (`/src/components/Footer.tsx`)
```typescript
export default function Footer() {
  return (
    <footer className="bg-contrast text-cream">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-serif mb-4">CORNERSTORE</h3>
            <p className="text-sm text-cream/70">
              Premium apparel for the modern intellectual.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-medium mb-4 uppercase text-sm tracking-wide">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/collections/womens">Women's</Link></li>
              <li><Link href="/collections/mens">Men's</Link></li>
              <li><Link href="/collections/accessories">Accessories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium mb-4 uppercase text-sm tracking-wide">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shipping">Shipping & Returns</Link></li>
              <li><Link href="/size-guide">Size Guide</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-medium mb-4 uppercase text-sm tracking-wide">Subscribe</h4>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full px-4 py-2 bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/50"
              />
              <button className="btn-primary w-full">Join</button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/20 flex justify-between text-sm text-cream/60">
          <p>© 2024 Cornerstore. All rights reserved.</p>
          <div className="space-x-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

#### C. ProductCard Component (`/src/components/ProductCard.tsx`)
```typescript
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="image-overlay aspect-[3/4] mb-4">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="space-y-1">
        <h3 className="font-medium text-sm uppercase tracking-wide">
          {product.name}
        </h3>
        <p className="text-neutral text-sm">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
```

### 2. Frontend Pages

#### Homepage (`/src/app/page.tsx`)
```typescript
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import CategoryGrid from '@/components/CategoryGrid';
import Philosophy from '@/components/Philosophy';

export default async function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <CategoryGrid />
      <Philosophy />
    </>
  );
}
```

#### Shop Page (`/src/app/shop/page.tsx`)
```typescript
'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import ProductGrid from '@/components/ProductGrid';
import FilterSidebar from '@/components/FilterSidebar';

export default function ShopPage() {
  const [filters, setFilters] = useState({});
  const { data, error, isLoading } = useSWR(
    ['/api/products', filters],
    () => api.products.getAll(filters)
  );

  return (
    <div className="container-custom section-padding">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <div className="lg:col-span-3">
          <ProductGrid 
            products={data?.data || []} 
            loading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
```

#### Product Detail Page (`/src/app/product/[slug]/page.tsx`)
```typescript
import { api } from '@/lib/api';
import ProductImages from '@/components/ProductImages';
import ProductInfo from '@/components/ProductInfo';
import RelatedProducts from '@/components/RelatedProducts';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const response = await api.products.getBySlug(params.slug);
  const product = response.data;

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container-custom section-padding">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductImages images={product.images} />
        <ProductInfo product={product} />
      </div>
      <RelatedProducts category={product.category} currentSlug={product.slug} />
    </div>
  );
}
```

#### Cart Page (`/src/app/cart/page.tsx`)
```typescript
'use client';

import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import Link from 'next/link';

export default function CartPage() {
  const { items, total, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="container-custom section-padding text-center">
        <h1 className="text-3xl font-serif mb-4">Your bag is empty</h1>
        <Link href="/shop" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom section-padding">
      <h1 className="text-4xl font-serif mb-12">Your Bag</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="bg-warm-beige p-8">
          <h2 className="text-xl font-serif mb-6">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Link href="/checkout" className="btn-primary w-full block text-center">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
```

#### Checkout Page (`/src/app/checkout/page.tsx`)
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import CheckoutForm from '@/components/CheckoutForm';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, getIdToken } = useAuth();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (shippingAddress: any) => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    try {
      setLoading(true);
      const token = await getIdToken();
      
      const orderData = {
        items,
        shippingAddress,
        paymentMethod: 'pending',
        subtotal: total,
        shippingCost: 0,
        tax: 0,
        total,
      };

      const response = await api.orders.create(token, orderData);
      
      if (response.success) {
        await clearCart();
        router.push(`/account/orders/${response.data._id}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom section-padding">
      <h1 className="text-4xl font-serif mb-12">Checkout</h1>
      <CheckoutForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
```

#### Account Pages (`/src/app/account/*`)
- `/account/page.tsx` - Account dashboard
- `/account/orders/page.tsx` - Order history
- `/account/orders/[id]/page.tsx` - Order details

#### Auth Pages
- `/src/app/login/page.tsx` - Sign in
- `/src/app/signup/page.tsx` - Sign up

### 3. Additional Components Needed

- Hero.tsx
- FeaturedProducts.tsx
- CategoryGrid.tsx
- Philosophy.tsx
- ProductGrid.tsx
- FilterSidebar.tsx
- ProductImages.tsx
- ProductInfo.tsx
- RelatedProducts.tsx
- CartItem.tsx
- CheckoutForm.tsx
- ProtectedRoute.tsx (HOC for auth)

---

## 🎨 Design Implementation Notes

### Brand Guidelines
- **Primary Font**: Crimson Pro (serif) for headings
- **Secondary Font**: Manrope (sans-serif) for body
- **Colors**:
  - Primary: #E8DDCF (Warm Beige)
  - Neutral: #8B857D (Warm Gray)
  - Contrast: #2E2E2C (Charcoal)
  - Background: #FAF7F2 (Cream)

### Image Requirements
All product and category images should be:
- High resolution (minimum 2000px width)
- Consistent aspect ratio (3:4 for products)
- Editorial, minimal styling
- Professional photography

Place images in:
- `/frontend/public/images/products/`
- `/frontend/public/images/categories/`
- `/frontend/public/images/hero/`

---

## 📦 Deployment Checklist

### Backend Deployment
1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Deploy to Railway/Render/Vercel Functions
4. Set up Firebase service account
5. Enable CORS for production domain

### Frontend Deployment  
1. Build production bundle: `npm run build`
2. Deploy to Vercel
3. Configure environment variables
4. Set up custom domain
5. Enable Analytics

### Post-Deployment
1. Seed production database
2. Test all flows end-to-end
3. Set up monitoring (Sentry, LogRocket)
4. Configure CDN for images
5. Enable rate limiting

---

## 🚀 Quick Start Commands

```bash
# Backend
cd backend
npm install
npm run seed     # Seed database
npm run dev      # Start on :3001

# Frontend
cd frontend
npm install
npm run dev      # Start on :3000
```

---

## 📚 Next Steps

1. **Implement Remaining Components** (listed above)
2. **Add Image Assets** to public directory
3. **Test Authentication Flow** with Firebase
4. **Implement Payment Integration** (Stripe recommended)
5. **Add Error Boundaries** and loading states
6. **Optimize Images** with Next.js Image
7. **Add Analytics** (Google Analytics, Mixpanel)
8. **Implement Email Notifications** (order confirmations)
9. **Add Admin Panel** for product/order management
10. **Set Up CI/CD** pipeline

---

## 🔧 Development Tips

- Use SWR for data fetching and caching
- Implement proper error handling and user feedback
- Add loading skeletons for better UX
- Use Next.js Image for automatic optimization
- Implement proper SEO meta tags
- Add sitemap and robots.txt
- Enable Progressive Web App features
- Implement proper logging

---

This guide provides the complete architecture. All core infrastructure is in place. 
Remaining work is primarily UI components and pages following the established patterns.
