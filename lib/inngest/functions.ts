import { inngest } from "./client";
import { sql } from "../db";

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

// New function to log events to Neon database
export const logEventToDatabase = inngest.createFunction(
  { 
    id: "log-event-to-database", 
    name: "Log Event to Database",
    retries: 3
  },
  { event: "app/event.log" },
  async ({ event, step }) => {
    const { eventName, eventType, payload, metadata } = event.data;
    
    // Step 1: Create event log entry
    const logEntry = await step.run("create-event-log", async () => {
      try {
        const result = await sql`
          INSERT INTO event_logs (
            event_name, 
            event_type, 
            status, 
            payload, 
            metadata
          ) VALUES (
            ${eventName || 'unknown'},
            ${eventType || 'general'},
            'processing',
            ${JSON.stringify(payload || {})},
            ${JSON.stringify(metadata || {})}
          )
          RETURNING id, event_name, created_at
        `;
        
        console.log(`Event log created with ID: ${result[0].id}`);
        return result[0];
      } catch (error) {
        console.error('Error creating event log:', error);
        throw error;
      }
    });
    
    // Step 2: Process the event (simulated processing)
    await step.sleep("process-delay", "2s");
    
    const processResult = await step.run("process-event", async () => {
      // Here you can add any custom processing logic
      console.log(`Processing event: ${logEntry.event_name}`);
      
      // Simulate some processing work
      const processingInfo = {
        processedAt: new Date().toISOString(),
        processorVersion: "1.0.0",
        nodeId: process.env.NODE_ENV || "development"
      };
      
      return processingInfo;
    });
    
    // Step 3: Update event log status
    const updateResult = await step.run("update-event-status", async () => {
      try {
        const result = await sql`
          UPDATE event_logs 
          SET 
            status = 'completed',
            processed_at = ${new Date().toISOString()},
            metadata = jsonb_set(
              COALESCE(metadata, '{}'), 
              '{processingInfo}', 
              ${JSON.stringify(processResult)}::jsonb
            ),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${logEntry.id}
          RETURNING id, status, processed_at
        `;
        
        console.log(`Event log ${logEntry.id} marked as completed`);
        return result[0];
      } catch (error) {
        console.error('Error updating event log:', error);
        
        // Mark as failed if update fails
        await sql`
          UPDATE event_logs 
          SET 
            status = 'failed',
            error_message = ${error.message},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${logEntry.id}
        `;
        
        throw error;
      }
    });
    
    // Step 4: Send notification (optional)
    if (event.data.sendNotification) {
      await step.run("send-notification", async () => {
        console.log(`Sending notification for event: ${logEntry.event_name}`);
        // Here you could integrate with email, Slack, etc.
        return { notificationSent: true };
      });
    }
    
    return {
      success: true,
      eventLogId: logEntry.id,
      eventName: logEntry.event_name,
      processedAt: updateResult.processed_at,
      processingInfo: processResult
    };
  }
);