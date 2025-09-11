// Test script for Airtable image sync to Cloudinary
import { inngest } from "./inngest/client";

// Test single image sync
export async function testSingleImageSync() {
  console.log("Testing single image sync from Airtable to Cloudinary...");
  
  try {
    const result = await inngest.send({
      name: "airtable/image.sync",
      data: {
        id: "test-marka-001",
        imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
        type: "marka",
        name: "Test Marka",
        folder: "test/markalar"
      }
    });
    
    console.log("Single image sync triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering single image sync:", error);
    throw error;
  }
}

// Test bulk markalar image sync
export async function testBulkMarkalarImageSync() {
  console.log("Testing bulk markalar image sync...");
  
  try {
    const result = await inngest.send({
      name: "airtable/markalar.images.bulk_sync",
      data: {
        source: "manual_test"
      }
    });
    
    console.log("Bulk markalar image sync triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering bulk markalar image sync:", error);
    throw error;
  }
}

// Test bulk hizmetler image sync
export async function testBulkHizmetlerImageSync() {
  console.log("Testing bulk hizmetler image sync...");
  
  try {
    const result = await inngest.send({
      name: "airtable/hizmetler.images.bulk_sync",
      data: {
        source: "manual_test"
      }
    });
    
    console.log("Bulk hizmetler image sync triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering bulk hizmetler image sync:", error);
    throw error;
  }
}

// Test manual markalar sync (which should trigger image sync)
export async function testMarkalarSyncWithImages() {
  console.log("Testing markalar sync with automatic image sync...");
  
  try {
    const result = await inngest.send({
      name: "markalar/sync.requested",
      data: {
        userId: "test-user",
        includeImages: true
      }
    });
    
    console.log("Markalar sync with images triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering markalar sync:", error);
    throw error;
  }
}

// Test manual hizmetler sync (which should trigger image sync)
export async function testHizmetlerSyncWithImages() {
  console.log("Testing hizmetler sync with automatic image sync...");
  
  try {
    const result = await inngest.send({
      name: "hizmetler/sync.requested",
      data: {
        userId: "test-user",
        includeImages: true
      }
    });
    
    console.log("Hizmetler sync with images triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering hizmetler sync:", error);
    throw error;
  }
}

// Run all image sync tests
export async function runAllImageSyncTests() {
  console.log("=== Starting Airtable Image Sync Tests ===\n");
  
  try {
    // Test 1: Single image sync
    console.log("1. Testing single image sync...");
    await testSingleImageSync();
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    
    // Test 2: Manual markalar sync (with image sync)
    console.log("\n2. Testing markalar sync with images...");
    await testMarkalarSyncWithImages();
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    // Test 3: Manual hizmetler sync (with image sync)
    console.log("\n3. Testing hizmetler sync with images...");
    await testHizmetlerSyncWithImages();
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    // Test 4: Bulk markalar image sync
    console.log("\n4. Testing bulk markalar image sync...");
    await testBulkMarkalarImageSync();
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    
    // Test 5: Bulk hizmetler image sync
    console.log("\n5. Testing bulk hizmetler image sync...");
    await testBulkHizmetlerImageSync();
    
    console.log("\n=== All image sync tests completed! ===");
    console.log("Check your Inngest dashboard and Cloudinary account for results.");
    
  } catch (error) {
    console.error("Image sync test suite failed:", error);
    throw error;
  }
}

// Helper function to check sync status
export async function checkImageSyncStatus() {
  console.log("Checking image sync status...");
  
  try {
    // This would require database access to check actual sync status
    // For now, we'll just log a message
    console.log("Image sync status check completed.");
    console.log("Please check your database for cloudinary_url and cloudinary_public_id fields:");
    console.log("- markalar table: SELECT id, marka_adi, logo_url, cloudinary_url FROM markalar WHERE cloudinary_url IS NOT NULL;");
    console.log("- hizmetler table: SELECT id, hizmet_adi, resim_url, cloudinary_url FROM hizmetler WHERE cloudinary_url IS NOT NULL;");
    
  } catch (error) {
    console.error("Error checking image sync status:", error);
    throw error;
  }
}

// Export test functions
export default {
  testSingleImageSync,
  testBulkMarkalarImageSync,
  testBulkHizmetlerImageSync,
  testMarkalarSyncWithImages,
  testHizmetlerSyncWithImages,
  runAllImageSyncTests,
  checkImageSyncStatus
};

// Usage example:
// import imageTests from '@/lib/test-airtable-image-sync';
// await imageTests.runAllImageSyncTests();