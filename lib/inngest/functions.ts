import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world", name: "Hello World Function" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email", name: "Send Welcome Email" },
  { event: "user/signup" },
  async ({ event, step }) => {
    const { email, name } = event.data;
    
    await step.run("log-new-user", async () => {
      console.log(`New user signed up: ${name} (${email})`);
    });
    
    await step.sleep("wait-before-email", "2s");
    
    const emailSent = await step.run("send-email", async () => {
      console.log(`Sending welcome email to ${email}`);
      return { sent: true, timestamp: new Date().toISOString() };
    });
    
    return {
      success: true,
      email: email,
      emailSent: emailSent
    };
  }
);

export const processDataSync = inngest.createFunction(
  { id: "process-data-sync", name: "Process Data Sync" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const data = await step.run("fetch-data", async () => {
      console.log("Fetching data for sync...");
      return { count: Math.floor(Math.random() * 100) };
    });
    
    await step.run("process-data", async () => {
      console.log(`Processing ${data.count} items...`);
      return { processed: data.count };
    });
    
    return {
      success: true,
      itemsProcessed: data.count,
      timestamp: new Date().toISOString()
    };
  }
);