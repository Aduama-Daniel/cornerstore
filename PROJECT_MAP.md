# Cornerstore Project Map

## What This Project Is

Cornerstore is a full-stack fashion e-commerce platform.

At a product level, it is not just a storefront. The codebase includes:

- A customer-facing shopping experience
- Firebase-based customer authentication
- Cart, checkout, wishlist, account, and order history flows
- Product reviews and recently viewed tracking
- Curated collections and color/size variation support
- A separate admin panel for catalog and operations work
- Analytics and reporting endpoints
- An AI shopping assistant powered by Gemini
- Paystack payment integration

The repo is organized as two apps:

- `frontend/`: Next.js 14 App Router app
- `backend/`: Fastify API backed by MongoDB

## High-Level Architecture

```text
Browser
  -> Next.js frontend
    -> calls Fastify API
      -> MongoDB
      -> Firebase Admin (token verification)
      -> Cloudinary (media uploads)
      -> Paystack (payment verification)
      -> Gemini API (chat assistant)
```

## Frontend Map

### Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Firebase client SDK
- Framer Motion

### Frontend responsibilities

- Render the public storefront
- Manage client auth state
- Manage cart, wishlist, and recently viewed state
- Fetch data from the backend API
- Render admin pages
- Launch Paystack checkout
- Show embedded AI chat assistant

### Root app wiring

`frontend/src/app/layout.tsx` wraps the app with:

- `AuthProvider`
- `CartProvider`
- `WishlistProvider`
- `RecentlyViewedProvider`
- `ToastProvider`
- global `Header`
- global `Footer`
- global `Chatbot`

That means most pages share the same shell and client state layer.

### Main customer routes

- `/` home page with editorial hero and category entry points
- `/shop` product listing experience
- `/product/[slug]` product detail page
- `/collections` collections index
- `/collections/[slug]` collection detail
- `/search` search UI
- `/cart` cart
- `/checkout` checkout and payment
- `/login` and `/signup`
- `/account`
- `/account/orders`
- `/account/orders/[id]`
- `/account/wishlist`
- `/wishlist`
- `/about`

### Admin routes

- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]/edit`
- `/admin/categories`
- `/admin/categories/new`
- `/admin/colors`
- `/admin/collections`
- `/admin/collections/new`
- `/admin/collections/[id]/edit`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/reviews`
- `/admin/returns`
- `/admin/analytics`

### Important frontend modules

- `frontend/src/lib/api.ts`
  Single API client for public, authenticated, and admin requests.

- `frontend/src/contexts/AuthContext.tsx`
  Uses Firebase Auth for customer login, signup, Google sign-in, logout, and ID token retrieval.

- `frontend/src/contexts/CartContext.tsx`
  Supports guest cart in `localStorage` and syncs to backend after login.

- `frontend/src/components/Chatbot.tsx`
  Floating assistant UI that sends message history to `/api/chat` and can render product cards or order status payloads.

- `frontend/src/components/admin/*`
  Admin UI building blocks for uploads, confirmations, badges, variation management, and media handling.

## Backend Map

### Stack

- Fastify
- MongoDB native driver
- Firebase Admin SDK
- Cloudinary
- Paystack
- Google Generative AI SDK

### Backend responsibilities

- Expose REST API for storefront and admin
- Verify Firebase bearer tokens for customer requests
- Use Basic Auth for admin requests
- Read and write MongoDB collections
- Manage orders, reviews, wishlist, inventory, and analytics
- Handle file uploads
- Provide AI shopping assistant responses

### Entry point

`backend/server.js` does the following:

- loads env vars
- creates Fastify server
- registers `helmet`, `cors`, `rate-limit`, and `multipart`
- connects MongoDB
- initializes Firebase Admin
- decorates Fastify with `db`
- registers all route groups under `/api/*`
- exposes `/health`

### Route groups

Public and customer APIs:

- `/api/products`
- `/api/categories`
- `/api/cart`
- `/api/orders`
- `/api/search`
- `/api/colors`
- `/api/inventory`
- `/api/collections`
- `/api/reviews`
- `/api/wishlist`
- `/api/analytics`
- `/api/user`
- `/api/chat`

Admin APIs:

- `/api/admin`
- `/api/admin/colors`
- `/api/admin/inventory`
- `/api/admin/collections`
- `/api/admin/reviews`
- `/api/admin/orders`
- `/api/admin/returns`
- `/api/admin/analytics`

### Service layer

The backend is service-driven. Each domain has its own file in `backend/src/services/`.

Core domains:

- `productService.js`
- `categoryService.js`
- `cartService.js`
- `orderService.js`
- `searchService.js`

Expanded domains:

- `collectionService.js`
- `colorService.js`
- `inventoryService.js`
- `reviewService.js`
- `wishlistService.js`
- `userService.js`
- `analyticsService.js`
- `orderAnalyticsService.js`
- `returnsService.js`
- `shippingService.js`
- `paymentService.js`
- `paystackService.js`
- `geminiService.js`
- `adminService.js`

## Authentication Model

There are two auth systems in this repo.

### Customer auth

- Frontend uses Firebase Auth
- Backend verifies Firebase ID tokens through `authMiddleware`
- Protected user routes use `Bearer <token>`

Used for:

- cart
- wishlist
- profile
- order history access
- posting reviews

### Admin auth

- Admin uses Basic Auth credentials
- Backend verifies credentials in `adminAuth`
- Frontend stores encoded admin credentials in `localStorage`

Used for:

- catalog management
- admin stats
- inventory updates
- collection management
- review moderation

This is separate from Firebase customer auth.

## Data Model

MongoDB collections referenced by the code include:

- `products`
- `categories`
- `orders`
- `carts`
- `users`
- `colors`
- `collections`
- `reviews`
- `inventory`
- `wishlist`
- `returns`
- `product_analytics`

### Product model shape

The product system is richer than the README suggests. Products can include:

- basic merchandising fields like `name`, `slug`, `description`, `price`, `status`
- editorial flags like `featured`, `trending`, and `tags`
- origin metadata
- legacy image arrays and newer media fields
- variations by `size` and `colorSlug`

### Inventory model

Inventory is stored separately and keyed by:

- `productId`
- `size`
- `colorSlug`

This means the project has moved toward variant-level stock management rather than simple size arrays only.

## Key User Flows

### Shopping flow

1. User browses products, collections, or search.
2. Product pages fetch by slug and show related products.
3. Recently viewed and analytics tracking are updated.

### Cart flow

1. Guest users can add items locally.
2. Logged-in users store cart server-side.
3. On login, guest cart is synced to backend.

### Checkout flow

1. User submits shipping info.
2. Frontend creates an order through the backend.
3. Paystack payment UI is launched.
4. On success, frontend updates order payment state and clears cart.

### Account flow

Users can access:

- profile/account page
- wishlist
- orders list
- order details

### Admin flow

Admins can manage:

- products
- categories
- colors
- collections
- orders
- reviews
- returns
- analytics dashboards

### AI assistant flow

The chatbot sends messages to `/api/chat`, which delegates to `geminiService.js`.

Gemini is configured with tool calls for:

- product search
- product detail lookup
- recommendations
- add to cart
- order tracking

The assistant can return structured payloads that the frontend renders as product cards or order status cards.

## What Seems Mature vs In Progress

### Mature or broadly wired

- storefront routing
- product browsing
- cart state
- account/order pages
- admin catalog pages
- review and wishlist support
- collections and color variation support

### More custom or still evolving

- AI shopping assistant
- returns and analytics operations tooling
- mixed legacy/new product media model
- payment verification and order state naming consistency
- variation migration support

## Notable Implementation Realities

These are important if someone starts extending the app.

### 1. The codebase is ahead of the README

The root docs mostly describe a simpler storefront, but the actual code includes:

- admin operations
- wishlist
- reviews
- returns
- analytics
- inventory variants
- Gemini chat
- Paystack

### 2. Product data has evolved

There are signs of an older simple product model and a newer variation/media model living side by side.

Examples:

- `images` still exists
- newer code also uses `mainMedia` and `additionalMedia`
- cart hydration contains compatibility logic for both

### 3. Guest checkout is supported

`frontend/src/app/checkout/page.tsx` explicitly removed the forced login redirect, so checkout can proceed without an authenticated user.

### 4. Admin auth and customer auth are different systems

This is an architectural decision worth knowing early because it affects:

- route protection
- frontend session handling
- admin API usage

### 5. Some admin-labeled route files are not protected in the route definition

From the route code, several endpoints under:

- `backend/src/routes/adminOrders.js`
- `backend/src/routes/analyticsAdmin.js`
- `backend/src/routes/returns.js`

do not currently show `adminAuth` as a pre-handler even though they are mounted under admin prefixes.

That does not change what the project is, but it is an important implementation detail.

### 6. Gemini currently has a hardcoded fallback API key in code

`backend/src/services/geminiService.js` falls back to an inline API key if env config is missing.

That is a major operational and security detail to be aware of.

## Suggested Mental Model

The cleanest way to think about this repo is:

Cornerstore is a premium-fashion storefront plus an internal commerce dashboard, with a Mongo-backed catalog/order system, Firebase customer identity, Paystack payments, and an AI-assisted shopping layer.

It is closer to a lightweight commerce platform than a basic marketing site.

## Best Starting Points If You Want To Explore Further

If you want to understand the project by reading code in order, start here:

1. `backend/server.js`
2. `frontend/src/lib/api.ts`
3. `frontend/src/app/layout.tsx`
4. `frontend/src/app/shop/page.tsx`
5. `frontend/src/app/product/[slug]/page.tsx`
6. `backend/src/routes/products.js`
7. `backend/src/services/productService.js`
8. `backend/src/routes/orders.js`
9. `backend/src/services/orderService.js`
10. `backend/src/services/geminiService.js`
