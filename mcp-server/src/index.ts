import * as readline from "readline";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";
import dotenv from "dotenv";

// Try multiple paths for .env file
const envPaths = [
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env.local"),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

// Fallback to hardcoded values if not loaded
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = "https://lgnxrkfssxusqzqlkoal.supabase.co";
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnbnhya2Zzc3h1c3F6cWxrb2FsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU2MjgzNCwiZXhwIjoyMDg2MTM4ODM0fQ.YqesnNRIwf-PRpouoNnrvxaI54nxVLl5bGX9m4fSLsM";
}

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabase) return supabase;

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  return supabase;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

console.error("supabase-mcp-server started");

function sendResponse(id: any, result: any) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

function sendError(id: any, message: string, code: number = -32000) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n");
}

rl.on("line", async (line) => {
  try {
    const cleanLine = line.replace(/^\uFEFF/, '');
    const msg = JSON.parse(cleanLine);

    if (!msg || !msg.method) return;

    const id = msg.id ?? null;

    if (msg.method === "initialize") {
      const resp = {
        jsonrpc: "2.0",
        id,
        result: {
          capabilities: {
            methods: [
              "supabase_list",
              "supabase_get",
              "supabase_create",
              "supabase_update",
              "supabase_delete",
            ],
          },
        },
      };
      process.stdout.write(JSON.stringify(resp) + "\n");
      return;
    }

    const sb = getSupabaseClient();

    // List records from a table
    if (msg.method === "supabase_list") {
      const table: string = msg.params?.table || "";
      const filters = msg.params?.filters || {};
      const limit = msg.params?.limit || 50;

      if (!table) {
        sendError(id, "Table name is required");
        return;
      }

      try {
        let query = sb.from(table).select("*").limit(limit);
        
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        sendResponse(id, { data, count: data?.length || 0 });
      } catch (err: any) {
        sendError(id, err?.message || String(err));
      }
      return;
    }

    // Get single record
    if (msg.method === "supabase_get") {
      const table: string = msg.params?.table || "";
      const id: string = msg.params?.id || "";

      if (!table || !id) {
        sendError(id, "Table and id are required");
        return;
      }

      try {
        const { data, error } = await sb.from(table).select("*").eq("id", id).single();
        
        if (error) throw error;
        sendResponse(id, { data });
      } catch (err: any) {
        sendError(id, err?.message || String(err));
      }
      return;
    }

    // Create record
    if (msg.method === "supabase_create") {
      const table: string = msg.params?.table || "";
      const record: object = msg.params?.record || {};

      if (!table || !Object.keys(record).length) {
        sendError(id, "Table name and record object are required");
        return;
      }

      try {
        const { data, error } = await sb.from(table).insert(record).select().single();

        if (error) throw error;
        sendResponse(id, { inserted: data });
      } catch (err: any) {
        sendError(id, err?.message || String(err));
      }
      return;
    }

    // Update record
    if (msg.method === "supabase_update") {
      const table: string = msg.params?.table || "";
      const record: object = msg.params?.record || {};
      const id: string = msg.params?.id || "";

      if (!table || !id || !Object.keys(record).length) {
        sendError(id, "Table, id, and record are required");
        return;
      }

      try {
        const { data, error } = await sb.from(table).update(record).eq("id", id).select().single();

        if (error) throw error;
        sendResponse(id, { updated: data });
      } catch (err: any) {
        sendError(id, err?.message || String(err));
      }
      return;
    }

    // Delete record
    if (msg.method === "supabase_delete") {
      const table: string = msg.params?.table || "";
      const id: string = msg.params?.id || "";

      if (!table || !id) {
        sendError(id, "Table and id are required");
        return;
      }

      try {
        const { data, error } = await sb.from(table).delete().eq("id", id).select().single();

        if (error) throw error;
        sendResponse(id, { deleted: data });
      } catch (err: any) {
        sendError(id, err?.message || String(err));
      }
      return;
    }

    sendResponse(id, { echo: msg, message: "Method not implemented" });
  } catch (err) {
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } }) + "\n");
  }
});
