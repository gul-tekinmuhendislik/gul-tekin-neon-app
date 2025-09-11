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
  syncHizmetlerManual
} from "@/lib/inngest/functions";

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
    syncHizmetlerManual
  ],
});