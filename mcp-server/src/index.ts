import * as readline from "readline";
import { exec } from "child_process";
import dotenv from "dotenv";

// Load .env.local first (if present), then fallback to .env
dotenv.config({ path: ".env.local" });
dotenv.config();

const MODEL_CMD_TEMPLATE = process.env.MODEL_CMD_TEMPLATE ?? "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

// Announce readiness (optional) so hosts can detect the server
process.stdout.write(
  JSON.stringify({
    jsonrpc: "2.0",
    method: "ready",
    params: { message: "mcp-server started" },
  }) + "\n",
);

function escapePromptForShell(prompt: string) {
  // Basic escaping for shell replacement; for complicated cases use a wrapper script
  return prompt.replace(/(["\\`$])/g, "\\$1");
}

function runModel(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!MODEL_CMD_TEMPLATE) {
      // Stub response when no model CLI configured
      resolve(
        "[stub] No MODEL_CMD_TEMPLATE configured. Set MODEL_CMD_TEMPLATE in .env to call a local model CLI.",
      );
      return;
    }

    const safePrompt = escapePromptForShell(prompt);
    const cmd = MODEL_CMD_TEMPLATE.replace(/\{prompt\}/g, safePrompt);

    exec(
      cmd,
      { maxBuffer: 10 * 1024 * 1024 },
      (err: Error | null, stdout: string, stderr: string) => {
        if (err) {
          reject(err);
          return;
        }
        resolve((stdout || stderr || "").toString().trim());
      },
    );
  });
}

rl.on("line", async (line) => {
  try {
    const msg = JSON.parse(line);

    if (msg && msg.method) {
      // Initialize handshake
      if (msg.method === "initialize") {
        const resp = {
          jsonrpc: "2.0",
          id: msg.id ?? 1,
          result: { capabilities: { methods: ["complete", "generate_code"] } },
        };
        process.stdout.write(JSON.stringify(resp) + "\n");
        return;
      }

      // Complete method: call local model CLI and return result
      if (msg.method === "complete") {
        const prompt: string = msg.params?.prompt ?? msg.params?.input ?? "";
        try {
          const out = await runModel(prompt);
          const resp = {
            jsonrpc: "2.0",
            id: msg.id ?? null,
            result: { completion: out },
          };
          process.stdout.write(JSON.stringify(resp) + "\n");
        } catch (err: any) {
          const resp = {
            jsonrpc: "2.0",
            id: msg.id ?? null,
            error: { code: -32000, message: err?.message ?? String(err) },
          };
          process.stdout.write(JSON.stringify(resp) + "\n");
        }

        return;
      }

      // generate_code method: ask the model to return JSON with files array and parse it
      if (msg.method === "generate_code") {
        const prompt: string = msg.params?.prompt ?? "";
        const filename: string | undefined = msg.params?.filename;
        const language: string | undefined = msg.params?.language;

        // Wrap the user's prompt with instructions asking for JSON output
        const wrapper = `You are a precise code generator. Respond with a single JSON object with a top-level field \"files\" which is an array. Each file must be an object with \"path\" (relative path), \"language\" (e.g., typescript, js, python), and \"content\" (string). Only output the JSON object, nothing else.\n\nUser prompt:\n${prompt}`;

        try {
          const out = await runModel(wrapper);

          // Try to extract JSON from the model output
          function extractJSON(s: string): any | null {
            const start = s.indexOf("{");
            const end = s.lastIndexOf("}");
            if (start === -1 || end === -1 || end <= start) return null;
            const candidate = s.slice(start, end + 1);
            try {
              return JSON.parse(candidate);
            } catch (e) {
              return null;
            }
          }

          const parsed = extractJSON(out);

          if (parsed && Array.isArray(parsed.files)) {
            const resp = {
              jsonrpc: "2.0",
              id: msg.id ?? null,
              result: { files: parsed.files },
            };
            process.stdout.write(JSON.stringify(resp) + "\n");
          } else {
            // Fallback: return raw output as a single file
            const single = {
              path: filename ?? "output.txt",
              language: language ?? "text",
              content: out,
            };
            const resp = {
              jsonrpc: "2.0",
              id: msg.id ?? null,
              result: { files: [single], raw: out },
            };
            process.stdout.write(JSON.stringify(resp) + "\n");
          }
        } catch (err: any) {
          const resp = {
            jsonrpc: "2.0",
            id: msg.id ?? null,
            error: { code: -32000, message: err?.message ?? String(err) },
          };
          process.stdout.write(JSON.stringify(resp) + "\n");
        }

        return;
      }

      // Echo any other requests
      const resp = {
        jsonrpc: "2.0",
        id: msg.id ?? null,
        result: { echo: msg },
      };
      process.stdout.write(JSON.stringify(resp) + "\n");
    }
  } catch (err) {
    const errMsg = {
      jsonrpc: "2.0",
      error: { code: -32700, message: "Parse error" },
    };
    process.stdout.write(JSON.stringify(errMsg) + "\n");
  }
});
