import { inngest } from "./client";
import { sql } from "../db";
import Exa from "exa-js";

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
        const errorMessage = error instanceof Error ? error.message : String(error);
        await sql`
          UPDATE event_logs 
          SET 
            status = 'failed',
            error_message = ${errorMessage},
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

// Exa API search function with cron job
export const searchAndSaveResults = inngest.createFunction(
  { 
    id: "search-and-save-results", 
    name: "Search with Exa API and Save Results",
    retries: 2
  },
  { 
    // Run every 5 minutes
    cron: "*/5 * * * *"
  },
  async ({ step }) => {
    // Step 1: Initialize Exa client
    const exa = new Exa(process.env.EXA_API_KEY || "");
    
    // Define mechanical engineering search queries - rotating through topics
    const allTopics = [
      "Isı Pompası Sistemleri yenilikler teknoloji",
      "Güneş Enerjisi Sistemleri fotovoltaik panel",
      "Su Depoları Hidrofor Sistemleri basınç tankı",
      "Yerden Isıtma Sistemleri radyant ısıtma",
      "Su Arıtma Sistemleri ters osmoz filtreleme",
      "Klima Sistemleri VRF inverter teknoloji",
      "Sulama Sistemleri damla sulama otomasyon",
      "Termosifonik Sistemler güneş enerjili su ısıtma"
    ];
    
    // Get current topic index from database or use timestamp
    const currentMinute = new Date().getMinutes();
    const topicIndex = Math.floor(currentMinute / 5) % allTopics.length;
    const searchQueries = [allTopics[topicIndex]];
    
    interface SearchResult {
      query: string;
      results: Array<{
        id?: string;
        title?: string | null;
        url?: string;
        text?: string;
        score?: number;
        publishedDate?: string;
        author?: string;
        highlights?: string[];
        summary?: string;
      }>;
      error?: string;
    }
    
    const allResults: SearchResult[] = [];
    
    // Step 2: Perform searches for each query
    for (const query of searchQueries) {
      const searchResults = await step.run(`search-${query.slice(0, 20)}`, async (): Promise<SearchResult> => {
        try {
          console.log(`Searching for: ${query}`);
          
          // Perform search with Exa API
          const results = await exa.search(query, {
            type: "auto",
            numResults: 5
          });
          
          return {
            query,
            results: results.results || []
          };
        } catch (error) {
          console.error(`Error searching for "${query}":`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            query,
            results: [],
            error: errorMessage
          };
        }
      });
      
      allResults.push(searchResults);
    }
    
    // Step 3: Save results to database
    const savedResults = await step.run("save-results-to-db", async () => {
      const savedCount: { total: number; queries: Record<string, number> } = { total: 0, queries: {} };
      
      for (const searchData of allResults) {
        if (searchData.error) {
          console.error(`Skipping save for query "${searchData.query}" due to error`);
          continue;
        }
        
        let queryCount = 0;
        
        for (const result of searchData.results) {
          try {
            await sql`
              INSERT INTO search_results (
                search_query,
                search_type,
                result_title,
                result_url,
                result_content,
                result_score,
                result_published_date,
                result_author,
                highlights,
                metadata
              ) VALUES (
                ${searchData.query},
                'auto',
                ${result.title || 'Untitled'},
                ${result.url || ''},
                ${result.text || ''},
                ${result.score || 0},
                ${result.publishedDate ? new Date(result.publishedDate) : null},
                ${result.author || null},
                ${result.highlights || []},
                ${JSON.stringify({
                  id: result.id,
                  summary: result.summary,
                  publishedDate: result.publishedDate
                })}
              )
            `;
            
            queryCount++;
            savedCount.total++;
          } catch (error) {
            console.error(`Error saving result for "${searchData.query}":`, error);
          }
        }
        
        savedCount.queries[searchData.query] = queryCount;
      }
      
      return savedCount;
    });
    
    // Step 4: Clean up old results (optional - keep only last 7 days)
    const cleanupResult = await step.run("cleanup-old-results", async () => {
      try {
        const result = await sql`
          DELETE FROM search_results 
          WHERE created_at < NOW() - INTERVAL '7 days'
          RETURNING id
        `;
        
        console.log(`Cleaned up ${result.length} old search results`);
        return { deletedCount: result.length };
      } catch (error) {
        console.error('Error cleaning up old results:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { deletedCount: 0, error: errorMessage };
      }
    });
    
    // Step 5: Log the operation
    await step.run("log-search-operation", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'exa.search.cron',
          'automation',
          'completed',
          ${JSON.stringify({
            queries: searchQueries,
            savedResults: savedResults,
            topicIndex: topicIndex,
            topic: allTopics[topicIndex]
          })},
          ${JSON.stringify({
            totalResults: savedResults.total,
            cleanupCount: cleanupResult.deletedCount,
            timestamp: new Date().toISOString()
          })}
        )
      `;
    });
    
    return {
      success: true,
      searchQueries: searchQueries,
      currentTopic: allTopics[topicIndex],
      topicIndex: topicIndex,
      totalResultsSaved: savedResults.total,
      resultsByQuery: savedResults.queries,
      oldResultsDeleted: cleanupResult.deletedCount,
      timestamp: new Date().toISOString()
    };
  }
);