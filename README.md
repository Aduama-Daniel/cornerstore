# Cornerstore - Premium Fashion E-commerce Platform

A full-stack, production-ready premium fashion e-commerce platform built with Next.js, Fastify, MongoDB, and Firebase Auth.

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend API**: Fastify (Node.js)
- **Database**: MongoDB
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **Image Optimization**: Next.js Image
- **State Management**: React Context + SWR

## 📁 Project Structure

```
cornerstore/
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities & services
│   │   ├── contexts/      # React contexts
│   │   └── hooks/         # Custom hooks
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Fastify API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # MongoDB models
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth & validation
│   │   └── utils/         # Helpers
│   ├── server.js
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Firebase account

### 1. Clone and Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Setup

#### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Backend `.env`

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/cornerstore
FIREBASE_PROJECT_ID=your_project_id
NODE_ENV=development
```

### 3. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# The application will create collections automatically
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## 📋 Features

### Authentication
- ✅ Email/password registration
- ✅ Google sign-in
- ✅ Protected routes
- ✅ Session persistence
- ✅ Account management

### Product System
- ✅ Product catalog with images
- ✅ Category-based browsing
- ✅ Size & variant management
- ✅ Product search
- ✅ Filtering (size, price, category)
- ✅ SEO-friendly URLs

### Shopping Experience
- ✅ Shopping cart with persistence
- ✅ Real-time cart updates
- ✅ Cart sync on login
- ✅ Secure checkout flow
- ✅ Order confirmation

### Order Management
- ✅ Order history
- ✅ Order details & tracking
- ✅ Order status updates

## 🎨 Design System

### Brand Colors
```css
--color-primary: #E8DDCF     /* Warm Beige */
--color-neutral: #8B857D     /* Warm Gray */
--color-contrast: #2E2E2C    /* Charcoal */
```

### Typography
- Display: Editorial serif font
- Body: Clean sans-serif
- Editorial, luxury-oriented spacing

## 📡 API Endpoints

### Products
- `GET /api/products` - All products
- `GET /api/products/:slug` - Product details
- `GET /api/products/category/:slug` - Products by category
- `GET /api/search?q=query` - Search products

### Cart
- `GET /api/cart/:userId` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart

### Orders
- `GET /api/orders/:userId` - User order history
- `GET /api/orders/details/:orderId` - Order details
- `POST /api/orders` - Create order

### Categories
- `GET /api/categories` - All categories

## 🔒 Security

- Firebase ID token verification
- Protected API routes
- Input validation
- XSS protection
- Rate limiting (production)

## 📦 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel
```

### Backend (Railway/Render)
```bash
cd backend
# Follow platform-specific deployment
```

### Database (MongoDB Atlas)
- Create cluster
- Update MONGODB_URI
- Add IP whitelist

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## 📄 License

Proprietary - Cornerstore

## 🤝 Contributing

Contact the development team for contribution guidelines.

---

Built with ❤️ for premium fashion
