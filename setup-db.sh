#!/bin/bash

# Moody Cow Database Setup Script
echo "🐄 Setting up Moody Cow Database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your actual credentials."
    echo ""
    echo "Required updates:"
    echo "1. SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET (get from https://developer.spotify.com/)"
    echo "2. DATABASE_URL (your PostgreSQL connection string)"
    echo "3. NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "4. JWT_SECRET (generate with: openssl rand -base64 32)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL and make sure it's running"
    echo "Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "macOS: brew install postgresql"
    exit 1
fi

# Check if database exists and create if not
echo "🗄️  Checking database connection..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Check if we can connect to the database
if npx prisma db pull --force 2>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection failed. Please check your DATABASE_URL in .env"
    echo "Make sure PostgreSQL is running and the database exists"
fi

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed"
    echo "Please check your database configuration and try again"
    exit 1
fi

# Seed database (optional)
echo "🌱 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with real API credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to use the app"
echo ""
echo "Happy mood-based music discovery! 🎵😊"
