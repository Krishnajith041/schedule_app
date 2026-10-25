import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-5b504a21/health", (c) => {
  return c.json({ status: "ok" });
});

// Data endpoints
app.get("/make-server-5b504a21/data", async (c) => {
  try {
    const [rawEvents, customCategories, foodTemplates] = await kv.mget(["events", "customCategories", "foodTemplates"]);
    
    let events = rawEvents || [];
    
    // Filter out events older than 3 months (Retention Policy)
    if (Array.isArray(events) && events.length > 0) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const validEvents = events.filter((e: any) => {
        if (!e.date) return false; 
        const eventDate = new Date(e.date);
        // Keep events that are in the future OR within the last 3 months
        return eventDate >= threeMonthsAgo;
      });
      
      // If we filtered out any events, update the storage
      if (validEvents.length < events.length) {
        console.log(`Auto-deleting ${events.length - validEvents.length} expired events older than 3 months`);
        await kv.set("events", validEvents);
        events = validEvents;
      }
    }

    return c.json({
      events: events,
      customCategories: customCategories || [],
      foodTemplates: foodTemplates || []
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-5b504a21/data", async (c) => {
  try {
    const body = await c.req.json();
    const { events, customCategories, foodTemplates } = body;
    
    // Validate that we are receiving arrays, or default to empty arrays if undefined
    // We don't want to overwrite with null/undefined if partial data is sent, 
    // but for this simple implementation we expect the full state.
    
    const keys = [];
    const values = [];
    
    if (events !== undefined) {
        keys.push("events");
        values.push(events);
    }
    if (customCategories !== undefined) {
        keys.push("customCategories");
        values.push(customCategories);
    }
    if (foodTemplates !== undefined) {
        keys.push("foodTemplates");
        values.push(foodTemplates);
    }
    
    if (keys.length > 0) {
        await kv.mset(keys, values);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving data:", error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);