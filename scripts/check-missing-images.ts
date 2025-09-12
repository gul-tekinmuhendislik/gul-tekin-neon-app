import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function checkMissingImages() {
  try {
    console.log("🔍 Checking for contents without images...\n");

    // Check contents with prompts but no images
    const missingImages = await sql`
      SELECT 
        id, 
        topic, 
        title,
        CASE 
          WHEN prompt IS NULL THEN 'No prompt'
          WHEN prompt = '' THEN 'Empty prompt'
          ELSE 'Has prompt'
        END as prompt_status,
        CASE 
          WHEN image_url IS NULL THEN 'No image'
          WHEN image_url = '' THEN 'Empty image'
          ELSE 'Has image'
        END as image_status,
        created_at
      FROM generated_content
      WHERE (image_url IS NULL OR image_url = '')
      ORDER BY created_at DESC
      LIMIT 20
    `;

    console.log(`📊 Found ${missingImages.length} contents without images:\n`);
    
    missingImages.forEach((content, index) => {
      console.log(`${index + 1}. ID: ${content.id}`);
      console.log(`   Topic: ${content.topic}`);
      console.log(`   Title: ${content.title || 'N/A'}`);
      console.log(`   Prompt Status: ${content.prompt_status}`);
      console.log(`   Image Status: ${content.image_status}`);
      console.log(`   Created: ${new Date(content.created_at).toLocaleDateString()}`);
      console.log('');
    });

    // Count totals
    const totals = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE prompt IS NOT NULL AND prompt != '' AND (image_url IS NULL OR image_url = '')) as ready_for_generation,
        COUNT(*) FILTER (WHERE (prompt IS NULL OR prompt = '') AND (image_url IS NULL OR image_url = '')) as needs_prompt_first,
        COUNT(*) FILTER (WHERE image_url IS NOT NULL AND image_url != '') as has_images,
        COUNT(*) as total_contents
      FROM generated_content
    `;

    console.log('📈 Summary:');
    console.log(`✅ Ready for image generation: ${totals[0].ready_for_generation}`);
    console.log(`⚠️  Needs prompt first: ${totals[0].needs_prompt_first}`);
    console.log(`🖼️  Already has images: ${totals[0].has_images}`);
    console.log(`📚 Total contents: ${totals[0].total_contents}`);

    // Show sample prompt if available
    const sampleWithPrompt = await sql`
      SELECT id, topic, prompt
      FROM generated_content
      WHERE prompt IS NOT NULL 
        AND prompt != ''
        AND (image_url IS NULL OR image_url = '')
      LIMIT 1
    `;

    if (sampleWithPrompt.length > 0) {
      console.log('\n📝 Sample prompt from content ready for image generation:');
      console.log(`ID: ${sampleWithPrompt[0].id}`);
      console.log(`Topic: ${sampleWithPrompt[0].topic}`);
      console.log(`Prompt preview: ${sampleWithPrompt[0].prompt.substring(0, 200)}...`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking missing images:", error);
    process.exit(1);
  }
}

// Run the function
checkMissingImages();