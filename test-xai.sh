#!/bin/bash

echo "🔧 Testing XAI API Integration"
echo "=============================="
echo ""

# Test API connection
echo "1. Testing XAI API Connection..."
echo "--------------------------------"
curl -s http://localhost:3000/api/xai/test | python3 -m json.tool
echo ""

# Test content generation
echo "2. Testing Content Generation..."
echo "--------------------------------"
curl -X POST http://localhost:3000/api/xai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate",
    "topic": "Modern Neon Tabela Teknolojileri",
    "keywords": ["neon tabela", "led teknoloji", "ışıklı reklam"],
    "contentType": "blog"
  }' | python3 -m json.tool
echo ""

# Test image prompt generation
echo "3. Testing Image Prompt Generation..."
echo "-------------------------------------"
curl -X POST http://localhost:3000/api/xai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "image",
    "topic": "Modern Neon Tabela Teknolojileri",
    "title": "Neon Tabelaların Geleceği"
  }' | python3 -m json.tool
echo ""

echo "✅ Tests completed!"