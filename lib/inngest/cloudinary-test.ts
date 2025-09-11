// Test script to verify Cloudinary integration with Inngest
import { inngest } from "./client";

// Test function to trigger Cloudinary upload
export async function testCloudinaryUpload() {
  console.log("Testing Cloudinary upload with Inngest...");
  
  try {
    // Test with a sample image URL (you can replace with actual file path)
    const testImageUrl = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300";
    
    // Trigger the Cloudinary upload function
    const result = await inngest.send({
      name: "cloudinary/upload",
      data: {
        file: testImageUrl,
        options: {
          folder: "test-uploads",
          public_id: "test-image-" + Date.now(),
          tags: ["test", "inngest"],
          quality: "auto:good",
          fetch_format: "auto"
        }
      }
    });
    
    console.log("Upload event triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering Cloudinary upload:", error);
    throw error;
  }
}

// Test transformation function
export async function testCloudinaryTransform() {
  console.log("Testing Cloudinary transform with Inngest...");
  
  try {
    // Test with transformation options
    const result = await inngest.send({
      name: "cloudinary/transform",
      data: {
        publicId: "test-uploads/sample-image", // Replace with actual public_id
        transformations: {
          width: 400,
          height: 300,
          crop: "fill",
          quality: "auto:good"
        },
        generateResponsive: true,
        aiTransformations: {
          removeBackground: false,
          improveQuality: true,
          upscale: false
        }
      }
    });
    
    console.log("Transform event triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering Cloudinary transform:", error);
    throw error;
  }
}

// Test batch upload function
export async function testCloudinaryBatchUpload() {
  console.log("Testing Cloudinary batch upload with Inngest...");
  
  try {
    const testUrls = [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300",
      "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400&h=300"
    ];
    
    const batchData = testUrls.map((url, index) => ({
      file: url,
      options: {
        folder: "test-batch",
        public_id: `batch-image-${index}-${Date.now()}`,
        tags: ["batch", "test", "inngest"]
      }
    }));
    
    const result = await inngest.send({
      name: "cloudinary/upload",
      data: {
        batch: batchData
      }
    });
    
    console.log("Batch upload event triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering Cloudinary batch upload:", error);
    throw error;
  }
}

// Test optimize existing images function
export async function testCloudinaryOptimizeExisting() {
  console.log("Testing Cloudinary optimize existing with Inngest...");
  
  try {
    const result = await inngest.send({
      name: "cloudinary/optimize-existing",
      data: {
        publicIds: ["test-uploads/sample-1", "test-uploads/sample-2"], // Replace with actual public_ids
        optimizations: {
          quality: "auto:best",
          format: "auto",
          generateResponsive: true,
          sizes: [320, 640, 768, 1024, 1280]
        }
      }
    });
    
    console.log("Optimize existing event triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering Cloudinary optimize:", error);
    throw error;
  }
}

// Test delete function
export async function testCloudinaryDelete() {
  console.log("Testing Cloudinary delete with Inngest...");
  
  try {
    const result = await inngest.send({
      name: "cloudinary/delete",
      data: {
        publicId: "test-uploads/test-image-to-delete", // Replace with actual public_id
        resourceType: "image"
      }
    });
    
    console.log("Delete event triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering Cloudinary delete:", error);
    throw error;
  }
}

// Test auto-tag function
export async function testCloudinaryAutoTag() {
  console.log("Testing Cloudinary auto-tag with Inngest...");
  
  try {
    const result = await inngest.send({
      name: "cloudinary/auto-tag",
      data: {
        publicId: "test-uploads/sample-image", // Replace with actual public_id
        options: {
          categorization: 'google_tagging',
          detection: 'google_video_tagging'
        }
      }
    });
    
    console.log("Auto-tag event triggered:", result);
    return result;
    
  } catch (error) {
    console.error("Error triggering Cloudinary auto-tag:", error);
    throw error;
  }
}

// Run all tests
export async function runAllCloudinaryTests() {
  console.log("=== Starting Cloudinary + Inngest Integration Tests ===\n");
  
  try {
    // Test 1: Single Upload
    console.log("1. Testing single upload...");
    await testCloudinaryUpload();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    // Test 2: Batch Upload
    console.log("\n2. Testing batch upload...");
    await testCloudinaryBatchUpload();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    // Test 3: Transform
    console.log("\n3. Testing transform...");
    await testCloudinaryTransform();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    // Test 4: Optimize Existing
    console.log("\n4. Testing optimize existing...");
    await testCloudinaryOptimizeExisting();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    // Test 5: Auto-tag
    console.log("\n5. Testing auto-tag...");
    await testCloudinaryAutoTag();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    console.log("\n=== All tests completed! Check your Inngest dashboard for results ===");
    
  } catch (error) {
    console.error("Test suite failed:", error);
    throw error;
  }
}

// Export test functions for use in other files
const cloudinaryTestSuite = {
  testCloudinaryUpload,
  testCloudinaryTransform,
  testCloudinaryBatchUpload,
  testCloudinaryOptimizeExisting,
  testCloudinaryDelete,
  testCloudinaryAutoTag,
  runAllCloudinaryTests
};

export default cloudinaryTestSuite;