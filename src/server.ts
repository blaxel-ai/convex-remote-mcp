import "@blaxel/telemetry";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerData } from "./tools/data.js";
import { registerEnv } from "./tools/env.js";
import { registerFunctionSpec } from "./tools/functionSpec.js";
import { registerLogs } from "./tools/logs.js";
import { registerRun } from "./tools/run.js";
import { registerRunOneoffQuery } from "./tools/runOneoffQuery.js";
import { registerTables } from "./tools/tables.js";
import express from 'express';

const server = new McpServer({
  name: "convex-mcp",
  version: "1.0.0",
  description: "A MCP server for Convex",
});

// Set up Express and HTTP transport
const app = express();
app.use(express.json());
registerData(server);
registerTables(server);
registerLogs(server);
registerFunctionSpec(server);
registerRun(server);
registerRunOneoffQuery(server);
registerEnv(server);

app.post('/mcp', async (req, res) => {
  // Create a new transport for each request to prevent request ID collisions
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  res.on('close', () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.BL_SERVER_PORT || '80');
const host = process.env.BL_SERVER_HOST || '0.0.0.0';

app.listen(port, () => {
  console.log(`MCP Server running on http://${host}:${port}/mcp`);
}).on('error', error => {
  console.error('Server error:', error);
  process.exit(1);
});
