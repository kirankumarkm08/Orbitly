# MCP Server (TypeScript)

This is a minimal MCP (Model Context Protocol) server scaffold.

Quick start:

- cd into `mcp-server/`
- npm install
- npm run dev

The server reads newline-delimited JSON messages on stdin and writes JSON responses on stdout.

See `.vscode/mcp.json` for an example VS Code MCP configuration.

## Using a free local model (gpt4all / llama.cpp) ✅

You can run this MCP server against a local model CLI (fully free) by configuring `MODEL_CMD_TEMPLATE` in `mcp-server/.env`.

Examples (put these in `mcp-server/.env` or `mcp-server/.env.local`):

- gpt4all CLI example:

  MODEL_CMD_TEMPLATE=gpt4all --model ./models/gpt4all-lora.bin --prompt "{prompt}" --n_predict 128

- llama.cpp example (adjust flags to your build):

  MODEL_CMD_TEMPLATE=./main -m ./models/llama-2-7b.ggml.q4_0.bin -p "{prompt}" -n 128

Notes:

- The server replaces `{prompt}` with the incoming prompt; choose a CLI that accepts a prompt argument. If your CLI accepts stdin, you can wrap it with a small shell script that reads stdin and calls the native app.
- If `MODEL_CMD_TEMPLATE` is not set, the server returns a stub response that you can use for testing.

How to use:

1. Add `MODEL_CMD_TEMPLATE` to `mcp-server/.env`.
2. Run the server: `cd mcp-server && npm run dev`.
3. Send an MCP `complete` request to the stdio server with `params.prompt` (or `params.input`). The server will call your local CLI and return the command output in `result.completion`.

Quick test (build + one-shot request):

- Build: `npm run build`
- Send a single request (Linux/macOS):

  printf '{"jsonrpc":"2.0","method":"complete","id":1,"params":{"prompt":"Hello from local model"}}\n' | node dist/index.js

- On PowerShell (Windows):

  echo '{"jsonrpc":"2.0","method":"complete","id":1,"params":{"prompt":"Hello from local model"}}' | node dist/index.js

---

### Code generation: `generate_code`

This server exposes a `generate_code` method that asks the model to return a JSON object with `files` (an array of `{path, language, content}`). The server will attempt to parse the model output as JSON and return `result.files`. If parsing fails, it falls back to returning a single file with the raw model output in `result.files[0]`.

Example request (JSON-RPC):

{
"jsonrpc":"2.0",
"method":"generate_code",
"id":1,
"params":{
"prompt":"Create file `src/utils/events.ts` with exported `fetchEvents(): Promise<{title:string;date:string;}[]>` using fetch and a Jest test in `src/__tests__/events.test.ts`",
"filename":"src/utils/events.ts",
"language":"typescript"
}
}

Quick test (build + one-shot request):

- Build: `npm run build`
- Send a single request (Linux/macOS):

  printf '{"jsonrpc":"2.0","method":"generate_code","id":1,"params":{"prompt":"Write a TypeScript hello world file","filename":"hello.ts","language":"typescript"}}\n' | node dist/index.js

- On PowerShell (Windows):

  echo '{"jsonrpc":"2.0","method":"generate_code","id":1,"params":{"prompt":"Write a TypeScript hello world file","filename":"hello.ts","language":"typescript"}}' | node dist/index.js
