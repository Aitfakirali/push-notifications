#!/bin/bash

# iOS Push Notification Testing - Quick Start
# This script helps you test push notifications on a real iPhone

echo "📱 iOS Push Notification Testing Setup"
echo "======================================"
echo ""

# Check if dev server is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Dev server is already running on port 3000"
else
    echo "⚠️  Dev server is not running on port 3000"
    echo ""
    echo "Please start it first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo "🌐 Starting ngrok tunnel..."
echo ""
echo "⚡ Quick Instructions:"
echo ""
echo "1. Wait for ngrok to start (see URL below)"
echo "2. Copy the HTTPS URL (looks like: https://abc123.ngrok.io)"
echo "3. Open Safari on your iPhone"
echo "4. Go to the ngrok URL"
echo "5. Click 'Enable Notifications'"
echo "6. Send test from your Mac's browser at http://localhost:3000"
echo ""
echo "📋 IMPORTANT NOTES:"
echo "  • Must use REAL iPhone (iOS 16.4+), NOT simulator"
echo "  • Must use Safari browser on iPhone"
echo "  • Lock iPhone to see notification appear"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start ngrok
ngrok http 3000

