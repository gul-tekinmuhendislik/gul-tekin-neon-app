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
  syncMarkalarDaily,
  syncMarkalarManual,
  syncHizmetlerDaily,
  syncHizmetlerManual,
  cloudinaryUpload,
  cloudinaryTransform,
  cloudinaryDelete,
  cloudinaryOptimizeExisting,
  cloudinaryAutoTag,
  syncAirtableImageToCloudinary,
  bulkSyncMarkalarImages,
  bulkSyncHizmetlerImages,
  bulkSyncUrunlerImages,
  dailyImageSync
} from "@/lib/inngest/functions";
import {
  syncProjelerDaily,
  syncProjelerManual,
  syncSingleProject
} from "@/lib/inngest/projeler-sync";
import {
  syncUrunlerDaily,
  syncUrunlerManual
} from "@/lib/inngest/urunler-sync";
import {
  syncAnafaaliyetDaily,
  syncAnafaaliyetManual
} from "@/lib/inngest/anafaaliyet-sync";
import { 
  generateMissingImages,
  scheduledImageGeneration,
  regenerateImage
} from "@/lib/inngest/image-generator";

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
    syncMarkalarDaily,
    syncMarkalarManual,
    syncHizmetlerDaily,
    syncHizmetlerManual,
    syncProjelerDaily,
    syncProjelerManual,
    syncSingleProject,
    syncUrunlerDaily,
    syncUrunlerManual,
    syncAnafaaliyetDaily,
    syncAnafaaliyetManual,
    cloudinaryUpload,
    cloudinaryTransform,
    cloudinaryDelete,
    cloudinaryOptimizeExisting,
    cloudinaryAutoTag,
    syncAirtableImageToCloudinary,
    bulkSyncMarkalarImages,
    bulkSyncHizmetlerImages,
    bulkSyncUrunlerImages,
    dailyImageSync,
    generateMissingImages,
    scheduledImageGeneration,
    regenerateImage
  ],
});