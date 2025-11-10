#!/bin/bash

# Script to get the local network IP address for mobile testing

echo "Finding your local network IP address..."
echo ""

# macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    if [ -z "$IP" ]; then
        IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
    fi
# Linux
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    IP=$(hostname -I | awk '{print $1}')
# Windows (Git Bash)
elif [[ "$OSTYPE" == "msys" ]]; then
    IP=$(ipconfig | grep "IPv4" | awk '{print $14}' | head -n 1)
else
    echo "Unsupported OS. Please find your IP manually."
    exit 1
fi

if [ -z "$IP" ]; then
    echo "Could not determine IP address. Please find it manually:"
    echo "  macOS: ifconfig | grep 'inet '"
    echo "  Linux: hostname -I"
    echo "  Windows: ipconfig"
    exit 1
fi

echo "Your local network IP: $IP"
echo ""
echo "To access from your phone:"
echo "  Frontend: http://$IP:3000"
echo "  Backend:  http://$IP:3001"
echo ""
echo "Make sure both devices are on the same Wi-Fi network!"
echo ""
echo "To start the frontend with network access:"
echo "  cd kanny-kanban-frontend && npm run dev:network"
echo ""
echo "To start the backend with network access:"
echo "  cd kanny-kanban-backend && npm run dev:network"
echo ""
echo "Update your frontend .env.local:"
echo "  NEXT_PUBLIC_API_URL=http://$IP:3001/api"

