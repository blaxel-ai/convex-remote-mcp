import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { convexFetch } from "../client";
import { getHeaders, getUrl } from "../utils";

const inputSchema = {
  tableName: z.string().describe("The name of the table to read from."),
  order: z.enum(["asc", "desc"]).describe("The order to sort the results in."),
  cursor: z.string().optional().describe("The cursor to start reading from."),
  limit: z
    .number()
    .max(1000)
    .optional()
    .describe("The maximum number of results to return, defaults to 100."),
};

const description = `
Read a page of data from a table in the project's Convex deployment.

Output:
- page: A page of results from the table.
- isDone: Whether there are more results to read.
- continueCursor: The cursor to use to read the next page of results.
`.trim();

export const registerData = (server: McpServer) => {
  server.registerTool(
    "data",
    {
      description,
      inputSchema,
    },
    async ({ tableName, order, cursor, limit }, { _meta }) => {
      const baseUrl = getUrl(_meta)
      const headers = getHeaders(_meta)
      const args = {
        table: tableName,
        order: order,
        paginationOpts: {
          numItems: limit ?? 100,
          cursor: cursor ?? null,
        },
      }
      const body = {
        path: "_system/cli/tableData",
        args,
      }
      const { data } = await convexFetch<{ value: any }>({
        baseUrl,
        method: "POST",
        path: `/api/query`,
        body,
        headers,
      })
      return {
        content: [{ type: "text", text: JSON.stringify(data.value) }],
        isError: false
      };
    },
  );
};