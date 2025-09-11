#!/bin/bash

echo "🎨 Testing Advanced XAI Prompt Generator V2.0"
echo "============================================="
echo ""

# Test with specific content ID
echo "1. Generate Advanced Prompt for Content ID 1..."
echo "-----------------------------------------------"
curl -X POST http://localhost:3000/api/xai/generate-prompts \
  -H "Content-Type: application/json" \
  -d '{"contentId": 1}' 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Failed"
echo ""

# Check the generated prompt from database
echo "2. Checking Generated Prompt in Database..."
echo "-------------------------------------------"
npx tsx -e "
import { sql } from './lib/db';
(async () => {
  const result = await sql\`
    SELECT 
      id, 
      topic, 
      prompt,
      metadata->'negativePrompt' as negative_prompt,
      metadata->'imageParameters' as parameters
    FROM generated_content 
    WHERE id = 1
  \`;
  if (result.length > 0) {
    console.log('Topic:', result[0].topic);
    console.log('\\nPrompt (first 200 chars):', result[0].prompt?.substring(0, 200) + '...');
    console.log('\\nNegative Prompt:', result[0].negative_prompt);
    console.log('\\nParameters:', JSON.stringify(result[0].parameters, null, 2));
  }
  process.exit(0);
})();
" 2>/dev/null || echo "Database check failed"
echo ""

echo "✅ Test completed!"
echo ""
echo "📝 Features:"
echo "- Advanced prompt with visual elements"
echo "- Negative prompt for better quality"
echo "- Image parameters (1920x1080, cfg_scale: 7.5)"
echo "- Topic-specific color schemes"
echo "- Regional elements (Bodrum/Milas)"
echo "- Composition rules for better layout"