# Cornerstore - Project Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Next.js 14 Frontend                     │  │
│  │  - App Router                                        │  │
│  │  - React 18 with Context API                        │  │
│  │  - Tailwind CSS                                      │  │
│  │  - SWR for data fetching                           │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Fastify API Server                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Backend Services                        │  │
│  │  - Product Management                               │  │
│  │  - Cart Operations                                  │  │
│  │  - Order Processing                                 │  │
│  │  - Search & Filtering                              │  │
│  │  - Authentication Middleware                        │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
    ┌─────────────────┐     ┌──────────────────┐
    │   MongoDB       │     │  Firebase Auth   │
    │   - Products    │     │  - Users         │
    │   - Categories  │     │  - Sessions      │
    │   - Orders      │     │  - Tokens        │
    │   - Carts       │     └──────────────────┘
    └─────────────────┘
```

## 📁 Project Structure

```
cornerstore/
├── backend/                    # Fastify API
│   ├── src/
│   │   ├── config/            # Database & Firebase config
│   │   │   ├── database.js
│   │   │   └── firebase.js
│   │   ├── middleware/        # Auth & validation
│   │   │   └── auth.js
│   │   ├── routes/            # API endpoints
│   │   │   ├── products.js
│   │   │   ├── categories.js
│   │   │   ├── cart.js
│   │   │   ├── orders.js
│   │   │   └── search.js
│   │   ├── services/          # Business logic
│   │   │   ├── productService.js
│   │   │   ├── categoryService.js
│   │   │   ├── cartService.js
│   │   │   ├── orderService.js
│   │   │   └── searchService.js
│   │   └── scripts/
│   │       └── seed.js        # Database seeding
│   ├── server.js              # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # Next.js Application
│   ├── public/
│   │   └── images/            # Static assets
│   │       ├── products/
│   │       ├── categories/
│   │       └── hero/
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── globals.css    # Global styles
│   │   │   ├── shop/
│   │   │   ├── product/[slug]/
│   │   │   ├── collections/[slug]/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── account/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── components/        # React components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── ...
│   │   ├── contexts/          # React Context
│   │   │   ├── AuthContext.tsx
│   │   │   └── CartContext.tsx
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # Utilities
│   │       ├── firebase.ts
│   │       └── api.ts
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── README.md
├── IMPLEMENTATION_GUIDE.md
├── .gitignore
└── setup.sh
```

## 🔄 Data Flow

### 1. Authentication Flow
```
User Login → Firebase Auth → Get ID Token → Include in API Requests → 
Backend Verifies Token → Grant Access → Return User Data
```

### 2. Product Browsing Flow
```
User Visits Shop → Next.js SSR/SSG → Fetch Products from API → 
Display Product Grid → User Clicks Product → Navigate to Product Detail → 
Fetch Single Product → Display with Add to Cart Option
```

### 3. Cart Management Flow
```
Add to Cart → Check if User Logged In
├─ Yes: Send to Backend → Update DB → Sync with Frontend
└─ No: Store Locally → On Login → Sync with Backend → Merge Carts
```

### 4. Checkout Flow
```
User Initiates Checkout → Verify Authentication → Collect Shipping Info → 
Create Order in DB → Clear Cart → Redirect to Confirmation → 
(Future: Process Payment)
```

## 🔐 Security Measures

1. **Authentication**
   - Firebase ID tokens for API requests
   - Token verification middleware on protected routes
   - Secure session management

2. **API Security**
   - CORS configuration
   - Helmet.js for security headers
   - Rate limiting (100 requests/minute)
   - Input validation on all endpoints

3. **Database Security**
   - MongoDB indexes for query optimization
   - User-specific data isolation
   - Proper error handling without data leaks

## 📊 Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique, indexed),
  description: String,
  price: Number,
  category: String (indexed),
  sizes: [String],
  images: [String],
  status: String (indexed),
  createdAt: Date (indexed)
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique, indexed),
  description: String,
  image: String
}
```

### Carts Collection
```javascript
{
  _id: ObjectId,
  userId: String (unique, indexed),
  items: [{
    id: String,
    productId: String,
    size: String,
    quantity: Number,
    price: Number
  }],
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String,
  userId: String (indexed),
  userEmail: String,
  items: [{
    productId: String,
    productName: String,
    productImage: String,
    size: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  subtotal: Number,
  shippingCost: Number,
  tax: Number,
  total: Number,
  status: String (indexed),
  paymentStatus: String,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

## 🎨 Design System

### Typography
- **Display**: Crimson Pro (serif) - 300, 400, 500, 600, 700
- **Body**: Manrope (sans-serif) - 300, 400, 500, 600, 700

### Color Palette
```css
--cream: #FAF7F2       /* Background */
--warm-beige: #E8DDCF  /* Primary */
--sand: #D4C8B8        /* Secondary */
--warm-gray: #8B857D   /* Neutral */
--charcoal: #2E2E2C    /* Contrast */
```

### Component Patterns
- Large hero images with minimal text overlay
- Editorial spacing (generous whitespace)
- Clean product grids (3:4 aspect ratio)
- Subtle hover animations
- Minimal UI chrome

## 🚀 Performance Optimizations

1. **Frontend**
   - Next.js Image optimization
   - Static generation where possible
   - SWR for client-side caching
   - Code splitting by route
   - Font optimization

2. **Backend**
   - Database indexes on frequently queried fields
   - Connection pooling
   - Response compression
   - Efficient query patterns

3. **Images**
   - WebP/AVIF format support
   - Lazy loading
   - Responsive image sizes
   - CDN delivery (production)

## 📈 Scalability Considerations

1. **Horizontal Scaling**
   - Stateless API design
   - Session management via Firebase
   - MongoDB replica sets

2. **Caching Strategy**
   - Client-side: SWR cache
   - API-level: Redis (future)
   - CDN: Static assets

3. **Database**
   - Proper indexing strategy
   - Query optimization
   - Sharding for large datasets (future)

## 🔧 Development Workflow

1. **Local Development**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Database Seeding**
   ```bash
   cd backend && npm run seed
   ```

3. **Testing**
   - Unit tests for services
   - Integration tests for API endpoints
   - E2E tests for critical flows

## 📝 API Endpoints Summary

### Products
- `GET /api/products` - All products
- `GET /api/products/featured` - Featured products
- `GET /api/products/category/:slug` - Products by category
- `GET /api/products/:slug` - Single product

### Categories
- `GET /api/categories` - All categories
- `GET /api/categories/:slug` - Single category

### Cart (Protected)
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove cart item
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/sync` - Sync local cart with server

### Orders (Protected)
- `GET /api/orders` - User order history
- `GET /api/orders/:orderId` - Order details
- `POST /api/orders` - Create order
- `PATCH /api/orders/:orderId/status` - Update order status

### Search
- `GET /api/search?q=query` - Search products

## 🎯 Future Enhancements

1. **Payment Integration**
   - Stripe for payment processing
   - Multiple payment methods
   - Saved payment methods

2. **Admin Panel**
   - Product management
   - Order fulfillment
   - Inventory tracking
   - Analytics dashboard

3. **Enhanced Features**
   - Wishlist functionality
   - Product reviews
   - Size recommendations
   - Virtual try-on (AR)
   - Email notifications
   - SMS updates

4. **Performance**
   - Redis caching
   - GraphQL API option
   - PWA capabilities
   - Offline support

5. **Analytics**
   - Google Analytics 4
   - Conversion tracking
   - User behavior analysis
   - A/B testing

---

**Built with precision for premium fashion e-commerce.**
