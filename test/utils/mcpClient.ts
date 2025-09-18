import { FunctionSchema } from "@blaxel/core";
import { Client } from "@modelcontextprotocol/sdk/client";
import { schemaToZodSchema } from "./schemaToZodSchema";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { tool } from "ai";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

export async function initMCPClient(metadata: Record<string, string> = {}) {
  const serverEntry = path.resolve(projectRoot, "src/server.ts");
  const transport = new StdioClientTransport({
    command: path.resolve(projectRoot, "node_modules/.bin/tsx"),
    args: [serverEntry],
    env: {
      ...process.env,
      NODE_NO_WARNINGS: "1",
    },
  });
  const client = new Client(
    {
      name: "convex-mcp",
      version: "1.0.0"
    }
  );
  await client.connect(transport)
  const result = await client.listTools();
  const tools = {}
  for (const t of result.tools) {
    const toolInstance = tool({
      description: t.description,
      inputSchema: schemaToZodSchema(t.inputSchema as FunctionSchema),
      execute: async (args, _) => {
        const result = await client.callTool({ name: t.name, arguments: args, _meta: metadata });
        return result
      }
    });
    tools[t.name] = toolInstance;
  }

  async function close() {
    await client.close();
  }

  return { client, tools, close } as const;
}


