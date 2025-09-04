import { BlaxelMcpServerTransport, env } from "@blaxel/core";
import "@blaxel/telemetry";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerData } from "./tools/data.js";
import { registerEnv } from "./tools/env.js";
import { registerFunctionSpec } from "./tools/functionSpec.js";
import { registerLogs } from "./tools/logs.js";
import { registerRun } from "./tools/run.js";
import { registerRunOneoffQuery } from "./tools/runOneoffQuery.js";
import { registerTables } from "./tools/tables.js";

const server = new McpServer({
  name: "convex-mcp",
  version: "1.0.0",
  description: "A MCP server for Convex",
});

function main() {
  const argv = process.argv.slice(2);
  const useStdio = argv.includes("--stdio");
  const useWebsocket = argv.includes("--websocket");

  let transport;
  if (useStdio) {
    transport = new StdioServerTransport();
  } else if (useWebsocket) {
    transport = new BlaxelMcpServerTransport();
  } else if (env.BL_SERVER_PORT) {
    transport = new BlaxelMcpServerTransport();
  } else {
    transport = new StdioServerTransport();
  }
  registerData(server);
  registerTables(server);
  registerLogs(server);
  registerFunctionSpec(server);
  registerRun(server);
  registerRunOneoffQuery(server);
  registerEnv(server);
  server.connect(transport);
  console.error("Server started");
}

main();
