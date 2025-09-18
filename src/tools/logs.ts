import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { convexFetch } from "../client";
import { getHeaders, getUrl } from "../utils";

const inputSchema = {
  cursor: z
    .number()
    .optional()
    .describe("Optional cursor (in ms) to start reading from. Use 0 to read from the beginning."),
  limit: z
    .number()
    .int()
    .positive()
    .max(1000)
    .optional()
    .describe("Maximum number of log entries to return."),
};

const description = (
  `Fetch a chunk of recent log entries from the deployment. Returns entries and a new cursor.`
);

export const registerLogs = (server: McpServer) => {
  server.registerTool(
    "logs",
    {
      description,
      inputSchema,
    },
    async ({ cursor, limit }, { _meta }) => {
      const baseUrl = getUrl(_meta);
      const headers = getHeaders(_meta)
      const { data } = await convexFetch<{ entries: unknown[]; newCursor: number }>({
        baseUrl,
        method: "GET",
        path: "/api/stream_function_logs",
        query: { cursor: cursor ?? 0 },
        headers,
      });
      const entries = Array.isArray(data.entries) ? data.entries : [];
      const limited = typeof limit === "number" && entries.length > limit
        ? entries.slice(entries.length - limit)
        : entries;
      return {
        content: [{ type: "text", text: JSON.stringify({ entries: limited, newCursor: data.newCursor }) }],
        isError: false,
      };
    },
  );
};


