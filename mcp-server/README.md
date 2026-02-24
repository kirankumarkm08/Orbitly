# MCP Server (Supabase)

Model Context Protocol server for Supabase database operations.

## Quick Start

```bash
cd mcp-server
npm install
npm run build
npm run dev
```

## Available Methods

| Method | Description |
|--------|-------------|
| `supabase_list` | List records from a table |
| `supabase_get` | Get single record by ID |
| `supabase_create` | Insert new record |
| `supabase_update` | Update existing record |
| `supabase_delete` | Delete record by ID |

## Usage

### List Records
```json
{
  "jsonrpc": "2.0",
  "method": "supabase_list",
  "id": 1,
  "params": {
    "table": "tenants",
    "filters": { "niche": "static" },
    "limit": 10
  }
}
```

### Get Record
```json
{
  "jsonrpc": "2.0",
  "method": "supabase_get",
  "id": 1,
  "params": {
    "table": "tenants",
    "id": "00000000-0000-0000-0000-000000000001"
  }
}
```

### Create Record
```json
{
  "jsonrpc": "2.0",
  "method": "supabase_create",
  "id": 1,
  "params": {
    "table": "tenants",
    "record": {
      "name": "New Tenant",
      "slug": "new-tenant",
      "niche": "ecommerce"
    }
  }
}
```

### Update Record
```json
{
  "jsonrpc": "2.0",
  "method": "supabase_update",
  "id": 1,
  "params": {
    "table": "tenants",
    "id": "00000000-0000-0000-0000-000000000001",
    "record": { "name": "Updated Name" }
  }
}
```

### Delete Record
```json
{
  "jsonrpc": "2.0",
  "method": "supabase_delete",
  "id": 1,
  "params": {
    "table": "tenants",
    "id": "00000000-0000-0000-0000-000000000001"
  }
}
```

## VS Code Integration

The MCP server is configured in `.vscode/mcp.json`. After making changes:

1. Restart VS Code
2. Or run "Developer: Reload Window"

## Test Tables

- `tenants` - Tenant/workspace records
- `users` - User profiles
- `pages` - Page builder pages
- `assets` - Uploaded files
- `page_templates` - Page templates

## Environment

The server loads Supabase credentials from:
1. `mcp-server/.env`
2. Root `.env` file

Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.
