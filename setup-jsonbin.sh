#!/bin/bash

# Setup script for JSONBin
# This script helps you create a JSONBin and upload your data

echo "==================================="
echo "JSONBin Setup Helper"
echo "==================================="
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "Error: curl is not installed. Please install curl first."
    exit 1
fi

echo "Step 1: Get your JSONBin API key"
echo "  1. Go to https://jsonbin.io/"
echo "  2. Sign up or log in"
echo "  3. Go to 'API Keys' section"
echo "  4. Copy your Master Key"
echo ""
read -p "Enter your JSONBin Master Key: " API_KEY

if [ -z "$API_KEY" ]; then
    echo "Error: API key is required"
    exit 1
fi

echo ""
echo "Step 2: Creating bin with remote publications data..."
echo ""

# Upload data to JSONBin
RESPONSE=$(curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Master-Key: $API_KEY" \
  -d @data-remote-publications.json \
  https://api.jsonbin.io/v3/b 2>/dev/null)

# Extract bin ID from response
BIN_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$BIN_ID" ]; then
    echo "Error: Failed to create bin"
    echo "Response: $RESPONSE"
    exit 1
fi

echo "✓ Success! Bin created with ID: $BIN_ID"
echo ""
echo "Your JSONBin URL is:"
echo "https://api.jsonbin.io/v3/b/$BIN_ID"
echo ""
echo "Step 3: Update data-loader.js"
echo ""
echo "Replace line 12 in scripts/data-loader.js with:"
echo "const REMOTE_JSON_URL = 'https://api.jsonbin.io/v3/b/$BIN_ID';"
echo ""
echo "And optionally update line 96 with your API key:"
echo "'X-Master-Key': '$API_KEY'"
echo ""
echo "==================================="
echo "Setup complete!"
echo "==================================="

