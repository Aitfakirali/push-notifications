#!/bin/bash

# Clean and rebuild the project with proper service worker setup

echo "🧹 Cleaning previous build..."

# Remove .next build folder
rm -rf .next

# Remove generated service worker files
rm -f public/sw.js
rm -f public/sw.js.map
rm -f public/workbox-*.js
rm -f public/worker-*.js
rm -f public/fallback-*.js

echo "📦 Building project..."
npm run build

echo "✨ Adding push notification handlers..."
npm run add-push-handlers

echo ""
echo "✅ Clean build complete!"
echo ""
echo "📋 Next steps:"
echo "  1. npm start (for production build)"
echo "  OR"
echo "  2. npm run dev (for development)"
echo ""

