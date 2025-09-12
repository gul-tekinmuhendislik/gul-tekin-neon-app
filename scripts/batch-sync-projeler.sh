#!/bin/bash

echo "🚀 Starting batch sync for projeler..."
echo "=================================="

BATCH=0
SIZE=20
BASE_URL="http://localhost:3000"

# First batch - clear existing data
echo "📋 Starting batch $BATCH (clearing existing data)..."
response=$(curl -s "${BASE_URL}/api/batch-sync-projeler?batch=$BATCH&size=$SIZE&clear=true")

# Check if the response is valid JSON
if ! echo "$response" | jq . >/dev/null 2>&1; then
    echo "❌ Error: Invalid JSON response"
    echo "$response"
    exit 1
fi

success=$(echo "$response" | jq -r '.success')
if [ "$success" != "true" ]; then
    echo "❌ Batch $BATCH failed"
    echo "$response" | jq -r '.error'
    exit 1
fi

total=$(echo "$response" | jq -r '.total')
processed=$(echo "$response" | jq -r '.processed')
progress=$(echo "$response" | jq -r '.progress.percentage')

echo "✅ Batch $BATCH completed: $processed records processed ($progress% total)"

# Continue with remaining batches
BATCH=1
while true; do
    echo ""
    echo "📋 Processing batch $BATCH..."
    
    # Wait 2 seconds as requested
    echo "⏳ Waiting 2 seconds..."
    sleep 2
    
    response=$(curl -s "${BASE_URL}/api/batch-sync-projeler?batch=$BATCH&size=$SIZE")
    
    # Check if the response is valid JSON
    if ! echo "$response" | jq . >/dev/null 2>&1; then
        echo "❌ Error: Invalid JSON response"
        echo "$response"
        exit 1
    fi
    
    success=$(echo "$response" | jq -r '.success')
    if [ "$success" != "true" ]; then
        echo "❌ Batch $BATCH failed"
        echo "$response" | jq -r '.error'
        exit 1
    fi
    
    processed=$(echo "$response" | jq -r '.processed')
    hasMore=$(echo "$response" | jq -r '.hasMore')
    progress=$(echo "$response" | jq -r '.progress.percentage')
    completed=$(echo "$response" | jq -r '.progress.completed')
    total=$(echo "$response" | jq -r '.progress.total')
    
    echo "✅ Batch $BATCH completed: $processed records processed"
    echo "📊 Progress: $completed/$total ($progress%)"
    
    # Show sample processed data
    sampleCount=$(echo "$response" | jq '.processedData | length')
    if [ "$sampleCount" -gt 0 ]; then
        echo "📝 Sample records:"
        echo "$response" | jq -r '.processedData[] | "  - \(.name) (\(.slug))"'
    fi
    
    if [ "$hasMore" != "true" ]; then
        break
    fi
    
    BATCH=$((BATCH + 1))
done

echo ""
echo "🎉 Batch sync completed successfully!"
echo "📊 Total records processed: $total"

# Final verification
echo ""
echo "🔍 Verifying results..."
verification=$(curl -s "${BASE_URL}/api/check-projeler")
if echo "$verification" | jq . >/dev/null 2>&1; then
    stats_total=$(echo "$verification" | jq -r '.stats.total')
    stats_with_name=$(echo "$verification" | jq -r '.stats.with_name')
    stats_with_image=$(echo "$verification" | jq -r '.stats.with_image')
    
    echo "✅ Verification complete:"
    echo "  📊 Total records in DB: $stats_total"
    echo "  📝 Records with names: $stats_with_name"
    echo "  🖼️  Records with images: $stats_with_image"
else
    echo "⚠️  Could not verify results"
fi

echo ""
echo "✨ All done! You can now check your projects."