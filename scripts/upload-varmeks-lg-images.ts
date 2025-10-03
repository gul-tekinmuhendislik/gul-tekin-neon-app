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
        width: result.width,
        height: result.height,
        format: result.format,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// Varmeks product images from their website
const varmeksImages = {
  "varm-up-series": [
    "https://solimpeks.com/wp-content/uploads/2025/01/Varmup-8kw-13kw-1.png",
    "https://solimpeks.com/wp-content/uploads/2025/01/Varmup-8kw-13kw-2.png",
  ],
  "varm-boost-series": [
    "https://cdn.b12.io/client_media/louJKCFb/da17e294-3808-11f0-b5d9-0242ac110002-png-hero_image.png",
    "https://cdn.b12.io/client_media/louJKCFb/da42e1d8-3808-11f0-b5d9-0242ac110002-png-regular_image.png",
  ],
  "general": [
    "https://cdn.b12.io/client_media/louJKCFb/70f3dc8c-4c44-11f0-9dfa-0242ac110002-png-regular_image.png",
    "https://cdn.b12.io/client_media/louJKCFb/96a90e5d-83f2-11f0-90da-0242ac110002--hero_image.jpg",
    "https://cdn.b12.io/client_media/louJKCFb/0b16ea3e-8989-11f0-a05c-0242ac110002-png-hero_image.png",
    "https://cdn.b12.io/client_media/louJKCFb/55e5c562-360b-11f0-9bbf-0242ac110002-png-hero_image.png",
    "https://cdn.b12.io/client_media/louJKCFb/e0260e6e-9a37-11f0-ad02-0242ac110002-png-hero_image.png",
  ]
};

// LG Therma V product images
const lgImages = {
  "therma-v-monobloc": [
    "https://www.lg.com/global/images/business/heating-R32-IWT/monobloc-2025-kv-d.jpg",
    "https://www.lg.com/global/images/business/heating-R32-IWT/monobloc-2025-kv-m.jpg",
    "https://s3.eu-west-2.amazonaws.com/imagerepositorypressloft/clients/33243/m/7962640_m.jpg",
  ]
};

async function uploadImages() {
  console.log("Starting Varmeks and LG image uploads to Cloudinary...\n");

  // Upload Varmeks images
  console.log("=== VARMEKS IMAGES ===");
  for (const [series, urls] of Object.entries(varmeksImages)) {
    console.log(`\nUploading ${series}...`);
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
          console.log(`  Public ID: ${result.data?.public_id}`);
        } else {
          console.log(`✗ Failed: ${url}`);
          console.log(`  Error: ${result.error}`);
        }
      } catch (error) {
        console.error(`✗ Error uploading ${url}:`, error);
      }
    }
  }

  // Upload LG images
  console.log("\n\n=== LG THERMA V IMAGES ===");
  for (const [model, urls] of Object.entries(lgImages)) {
    console.log(`\nUploading ${model}...`);
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const result = await uploadToCloudinary(url, {
          folder: "gul-tekin/lg",
          public_id: `lg-${model}-${i + 1}`,
          tags: ["lg", "therma-v", "heat-pump", model],
        });

        if (result.success) {
          console.log(`✓ Uploaded: ${result.data?.url}`);
          console.log(`  Public ID: ${result.data?.public_id}`);
        } else {
          console.log(`✗ Failed: ${url}`);
          console.log(`  Error: ${result.error}`);
        }
      } catch (error) {
        console.error(`✗ Error uploading ${url}:`, error);
      }
    }
  }

  // Note: Database updates will be done separately

  console.log("\n\n✅ Upload complete!");
  console.log("\nNext steps:");
  console.log("1. Check the uploaded images in your Cloudinary dashboard");
  console.log("2. Update the database with the correct Cloudinary URLs for each product");
  console.log("3. Test the images on the website");
}

uploadImages().catch(console.error);
