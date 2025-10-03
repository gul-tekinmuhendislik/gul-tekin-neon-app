import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { 
  helloWorld, 
  sendWelcomeEmail,
  processDataSync,
  logEventToDatabase,
  searchAndSaveResults,
  generateEngineeringContent,
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
  bulkShareOnTwitter,
  monitorTwitterHealth
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
import {
  generateMissingImages,
  scheduledImageGeneration,
  regenerateImage
} from "@/lib/inngest/image-generator";
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
  syncGoogleBusinessLocations,
  syncGoogleBusinessManual,
  autoReplyToReviews,
  createGoogleBusinessPost
} from "@/lib/inngest/google-business";
import {
  generateBlogImageWithVertexAI,
  generateVertexImagesHourly
} from "@/lib/inngest/vertex-ai-generation";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    sendWelcomeEmail,
    processDataSync,
    logEventToDatabase,
    searchAndSaveResults,
    generateEngineeringContent,
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
    generateMissingImages,
    scheduledImageGeneration,
    regenerateImage,
    generateImageForBlog,
    generatePromptForContent,
    testGoogleGemini,
    generateContentWithGemini,
    generateImageWithGeminiPrompt,
    batchGenerateWithGemini,
    suggestImageWithGemini,
    shareBlogOnTwitter,
    bulkShareOnTwitter,
    monitorTwitterHealth,
    syncGoogleBusinessLocations,
    syncGoogleBusinessManual,
    autoReplyToReviews,
    createGoogleBusinessPost,
    generateBlogImageWithVertexAI,
    generateVertexImagesHourly
  ],
});