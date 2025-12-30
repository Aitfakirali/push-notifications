#!/bin/bash

# Startup script for Push Notifications App

echo "🚀 Starting Push Notifications App"
echo "===================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo ""
    echo "Creating .env.local from generated keys..."
    echo ""
    
    # Generate keys
    node scripts/generate-vapid-keys.js > /tmp/keys.txt 2>&1
    
    # Extract keys and create .env.local
    PUBLIC_KEY=$(grep "NEXT_PUBLIC_VAPID_PUBLIC_KEY" /tmp/keys.txt | cut -d'=' -f2)
    PRIVATE_KEY=$(grep "VAPID_PRIVATE_KEY" /tmp/keys.txt | grep -v "NEXT_PUBLIC" | cut -d'=' -f2)
    CRON_SECRET=$(grep "CRON_SECRET" /tmp/keys.txt | cut -d'=' -f2)
    
    cat > .env.local << EOF
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${PUBLIC_KEY}
VAPID_PRIVATE_KEY=${PRIVATE_KEY}
VAPID_SUBJECT=mailto:your-email@example.com
CRON_SECRET=${CRON_SECRET}
APP_URL=http://localhost:3000
EOF
    
    echo "✅ Created .env.local with generated keys"
    echo ""
    rm /tmp/keys.txt
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Create icons if they don't exist or are placeholders
if [ ! -s public/icon-192x192.png ] || [ $(wc -c < public/icon-192x192.png) -lt 1000 ]; then
    echo "🎨 Creating icon placeholders..."
    node scripts/create-icons.js
    echo ""
fi

echo "✨ Setup complete!"
echo ""
echo "Starting development server..."
echo "➜  Local: http://localhost:3000"
echo ""
echo "To start the cron scheduler (for daily notifications):"
echo "  npm run cron"
echo ""
echo "===================================="
echo ""

# Start the dev server
npm run dev

