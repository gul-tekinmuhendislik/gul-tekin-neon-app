#!/bin/bash

echo "🎨 Testing XAI Prompt Generator"
echo "================================"
echo ""

# Check stats
echo "1. Checking Content Stats..."
echo "----------------------------"
curl -X GET http://localhost:3000/api/xai/generate-prompts 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Stats endpoint failed"
echo ""

# Generate prompt for one content
echo "2. Generate Prompt for One Content..."
echo "-------------------------------------"
curl -X POST http://localhost:3000/api/xai/generate-prompts \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Single prompt generation failed"
echo ""

# Generate prompts in batch
echo "3. Batch Generate Prompts (up to 10)..."
echo "----------------------------------------"
curl -X POST http://localhost:3000/api/xai/generate-prompts \
  -H "Content-Type: application/json" \
  -d '{"batchProcess": true}' 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Batch generation failed"
echo ""

# Generate for specific content ID
echo "4. Generate for Specific Content (ID: 1)..."
echo "-------------------------------------------"
curl -X POST http://localhost:3000/api/xai/generate-prompts \
  -H "Content-Type: application/json" \
  -d '{"contentId": 1}' 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Specific content generation failed"
echo ""

echo "✅ Tests completed!"