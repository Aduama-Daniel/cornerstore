#!/bin/bash

echo "🏪 Cornerstore - Development Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo ""

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas."
    echo "   Visit: https://www.mongodb.com/try/download/community"
    echo ""
fi

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

echo "Installing backend dependencies..."
npm install

echo ""
echo "✓ Backend setup complete"
echo ""

# Frontend setup
echo "📦 Setting up frontend..."
cd ../frontend

if [ ! -f .env.local ]; then
    echo "Creating .env.local file from .env.local.example..."
    cp .env.local.example .env.local
    echo "⚠️  Please update .env.local with your Firebase configuration"
fi

echo "Installing frontend dependencies..."
npm install

echo ""
echo "✓ Frontend setup complete"
echo ""

# Final instructions
echo "=================================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MongoDB URI and Firebase config"
echo "2. Update frontend/.env.local with your Firebase config"
echo "3. Start MongoDB: mongod"
echo "4. Seed database: cd backend && npm run seed"
echo "5. Start backend: cd backend && npm run dev"
echo "6. Start frontend: cd frontend && npm run dev"
echo ""
echo "Visit http://localhost:3000 to see your application!"
echo "=================================="
