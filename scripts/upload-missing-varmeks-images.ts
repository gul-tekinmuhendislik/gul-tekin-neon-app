import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Upload function
async function uploadToCloudinary(url: string, options: any) {
  try {
    const result = await cloudinary.uploader.upload(url, options);
    return {
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// New product images found
const newImages = {
  "silent-pool": [
    "https://solimpeks.com/wp-content/uploads/2025/01/Silent-Pool-Series-heat-pump1.png",
    "https://solimpeks.com/wp-content/uploads/2025/01/Silent-Pool-Series-heat-pump2.png",
  ],
  "commercial-pool": [
    "https://solimpeks.com/wp-content/uploads/2025/02/commercial-pool-52-75kw.png",
    "https://solimpeks.com/wp-content/uploads/2025/02/commercial-pool-26kw.png",
    "https://solimpeks.com/wp-content/uploads/2025/02/commercial-pool-100-121-145kw.png",
  ],
  "commercial-duo": [
    "https://cdn.b12.io/client_media/louJKCFb/70f3dc8c-4c44-11f0-9dfa-0242ac110002-png-regular_image.png",
  ],
  "all-series": [
    "https://cdn.b12.io/client_media/louJKCFb/e0260e6e-9a37-11f0-ad02-0242ac110002-png-hero_image.png",
  ]
};

async function uploadImages() {
  console.log("Uploading missing Varmeks product images...\n");

  for (const [series, urls] of Object.entries(newImages)) {
    console.log(`\n=== Uploading ${series} ===`);
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const result = await uploadToCloudinary(url, {
          folder: "gul-tekin/varmeks",
          public_id: `varmeks-${series}-${i + 1}`,
          tags: ["varmeks", "heat-pump", series],
        });

        if (result.success) {
          console.log(`✓ Uploaded: ${result.data?.url}`);
          console.log(`  Public ID: varmeks-${series}-${i + 1}`);
        } else {
          console.log(`✗ Failed: ${url}`);
          console.log(`  Error: ${result.error}`);
        }
      } catch (error) {
        console.error(`✗ Error uploading ${url}:`, error);
      }
    }
  }

  console.log("\n\n✅ Upload complete!");
}

uploadImages().catch(console.error);
