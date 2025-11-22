import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  helloWorld,
  sendWelcomeEmail,
  logEventToDatabase,
  processNewContent,
  applyEEATOptimizations,
  postToFacebook,
  checkAndRefreshFacebookToken,
  monitorTokenExpiry,
  cloudinaryUpload,
  cloudinaryTransform,
  cloudinaryDelete,
  cloudinaryOptimizeExisting,
  cloudinaryAutoTag,
  generatePromptForContent
} from "@/lib/inngest/functions";
import {
  generateImageForBlog
} from "@/lib/inngest/fal-ai-generation";
import {
  shareBlogOnTwitter,
  bulkShareOnTwitter
} from "@/lib/inngest/twitter-functions";
// Airtable sync removed - data now managed directly in Neon
// import {
//   syncUrunlerDaily,
//   syncUrunlerManual
// } from "@/lib/inngest/urunler-sync";
// import {
//   syncAnafaaliyetDaily,
//   syncAnafaaliyetManual
// } from "@/lib/inngest/anafaaliyet-sync";
// Image generator functions removed - no longer in use
import {
  testGoogleGemini,
  generateContentWithGemini
} from "@/lib/inngest/google-gemini-test";
import {
  generateImageWithGeminiPrompt,
  batchGenerateWithGemini,
  suggestImageWithGemini
} from "@/lib/inngest/gemini-image-generation";
import {
  generateBlogImageWithVertexAI
  // generateVertexImagesHourly - REMOVED: Vertex AI access no longer available
} from "@/lib/inngest/vertex-ai-generation";
import {
  autoPostBlogToFacebook
} from "@/lib/inngest/auto-facebook-post";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    sendWelcomeEmail,
    logEventToDatabase,
    processNewContent,
    applyEEATOptimizations,
    postToFacebook,
    checkAndRefreshFacebookToken,
    monitorTokenExpiry,
    // Airtable sync functions removed
    // syncUrunlerDaily,
    // syncUrunlerManual,
    // syncAnafaaliyetDaily,
    // syncAnafaaliyetManual,
    cloudinaryUpload,
    cloudinaryTransform,
    cloudinaryDelete,
    cloudinaryOptimizeExisting,
    cloudinaryAutoTag,
    generateImageForBlog,
    generatePromptForContent,
    testGoogleGemini,
    generateContentWithGemini,
    generateImageWithGeminiPrompt,
    batchGenerateWithGemini,
    suggestImageWithGemini,
    shareBlogOnTwitter,
    bulkShareOnTwitter,
    generateBlogImageWithVertexAI,
    // generateVertexImagesHourly - REMOVED: Vertex AI access no longer available
    autoPostBlogToFacebook
  ],
});