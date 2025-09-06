import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { 
  helloWorld, 
  sendWelcomeEmail,
  processDataSync,
  logEventToDatabase 
} from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    sendWelcomeEmail,
    processDataSync,
    logEventToDatabase
  ],
});