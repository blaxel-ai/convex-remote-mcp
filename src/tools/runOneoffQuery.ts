import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getConfigValue, getHeaders, getUrl } from "../utils";

const inputSchema = {
  query: z
    .string()
    .describe("JavaScript source implementing a readonly Convex query function."),
};

const description = (
  `Run a one-off readonly query on the deployment and return result and logLines.`
);

export const registerRunOneoffQuery = (server: McpServer) => {
  server.registerTool(
    "runOneoffQuery",
    {
      description,
      inputSchema,
    },
    async ({ query }, { _meta, requestInfo }) => {
      const baseUrl = getUrl(_meta, requestInfo);
      const headers = getHeaders(_meta, requestInfo);
      const response = await fetch(`${baseUrl}/api/run_test_function`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers  },
        body: JSON.stringify({
          adminKey: getConfigValue(
            _meta?.adminKey,
            "x-convex-admin-key",
            "ADMIN_KEY",
            headers
          ),
          args: {},
          bundle: { path: "testQuery.js", source: query },
          format: "convex_encoded_json",
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error ${response.status}: ${text}`);
      }
      const result = await response.json() as { status: string, value: any, logLines: string[] };
      if (result.status !== "success") {
        throw new Error(`Query failed: ${JSON.stringify(result)}`);
      }
      return {
        content: [{ type: "text", text: JSON.stringify({ result: result.value, logLines: result.logLines }) }],
        isError: false,
      };
    },
  );
};


